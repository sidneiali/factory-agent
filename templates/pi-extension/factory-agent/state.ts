import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface FactoryState {
	version: string;
	project: string;
	folders: { product: string; delivery: string; operations: string };
	activeWork: string | null;
	runtime?: {
		status: string;
		currentAgent: string | null;
		pendingGate: unknown;
		approvals: Array<Record<string, unknown>>;
		startedAt?: string;
		updatedAt?: string;
	};
	[key: string]: unknown;
}

export interface PhysicalStatus {
	installed: boolean;
	stage: string;
	nextAgent: string | null;
	reason: string;
	pendingGate?: unknown;
}

function statePath(cwd: string) {
	return join(cwd, ".factory", "state.json");
}

export function readFactoryState(cwd: string): FactoryState | null {
	const path = statePath(cwd);
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, "utf8")) as FactoryState;
	} catch {
		return null;
	}
}

export function writeFactoryState(cwd: string, state: FactoryState) {
	const path = statePath(cwd);
	mkdirSync(dirname(path), { recursive: true });
	const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
	writeFileSync(temporary, JSON.stringify(state, null, 2) + "\n", "utf8");
	renameSync(temporary, path);
}

export function appendFactoryEvent(cwd: string, event: Record<string, unknown>) {
	const path = join(cwd, ".factory", "events.jsonl");
	mkdirSync(dirname(path), { recursive: true });
	appendFileSync(path, JSON.stringify({ ts: new Date().toISOString(), ...event }) + "\n", "utf8");
}

function approved(path: string): boolean {
	return existsSync(path) && /(?:status|resultado)\s*:\s*(?:approved|aprovado)/i.test(readFileSync(path, "utf8"));
}

function actionsClosed(path: string): boolean {
	if (!existsSync(path)) return false;
	const boxes = [...readFileSync(path, "utf8").matchAll(/\[( |x|X)\]/g)].map((match) => match[1].toUpperCase());
	return boxes.length > 0 && boxes.every((box) => box === "X");
}

export function getFactoryStatus(cwd: string): PhysicalStatus {
	const state = readFactoryState(cwd);
	if (!state) return { installed: false, stage: "not-installed", nextAgent: null, reason: ".factory/state.json ausente" };
	if (state.runtime?.pendingGate) {
		return { installed: true, stage: "awaiting-approval", nextAgent: state.runtime.currentAgent, reason: "há gate pendente", pendingGate: state.runtime.pendingGate };
	}
	const product = join(cwd, state.folders.product);
	if (!existsSync(join(product, "brief.md"))) return { installed: true, stage: "intake", nextAgent: "factory-discovery", reason: "brief.md ausente" };
	if (!existsSync(join(product, "requirements.md"))) return { installed: true, stage: "requirements", nextAgent: "factory-requirements", reason: "requirements.md ausente" };
	if (!existsSync(join(product, "architecture.md"))) return { installed: true, stage: "architecture", nextAgent: "factory-architect", reason: "architecture.md ausente" };
	if (!state.activeWork) return { installed: true, stage: "planning", nextAgent: "factory-plan", reason: "entrega ativa ausente" };
	const work = join(cwd, state.folders.delivery, state.activeWork);
	const actions = join(work, "actions.md");
	if (!existsSync(join(work, "roadmap.md")) || !existsSync(actions)) return { installed: true, stage: "planning", nextAgent: "factory-plan", reason: "roadmap ou actions ausente" };
	if (!actionsClosed(actions)) return { installed: true, stage: "implementation", nextAgent: "factory-developer", reason: "ações abertas" };
	if (!existsSync(join(work, "review.md"))) return { installed: true, stage: "review", nextAgent: "factory-reviewer", reason: "review ausente" };
	if (!existsSync(join(work, "qa-report.md"))) return { installed: true, stage: "qa", nextAgent: "factory-qa", reason: "QA ausente" };
	if (!approved(join(work, "qa-report.md"))) return { installed: true, stage: "qa-blocked", nextAgent: "factory-developer", reason: "QA reprovado" };
	if (!approved(join(work, "acceptance.md"))) return { installed: true, stage: "acceptance", nextAgent: "factory-acceptance", reason: "aceite ausente ou reprovado" };
	if (!existsSync(join(work, "documentation.md"))) return { installed: true, stage: "documentation", nextAgent: "factory-documentation", reason: "documentação ausente" };
	return { installed: true, stage: "done", nextAgent: null, reason: "fluxo concluído" };
}

export function startPiWorkflow(cwd: string, idea: string) {
	const state = readFactoryState(cwd);
	if (!state) throw new Error("Factory Agent não está instalado.");
	if (!idea.trim()) throw new Error("Descreva a ideia do projeto.");
	if (state.runtime?.status && state.runtime.status !== "done") throw new Error("Já existe workflow ativo. Use /factory-resume.");
	const intake = join(cwd, ".factory", "intake.md");
	writeFileSync(intake, `# Ideia inicial\n\n${idea.trim()}\n`, "utf8");
	state.activeWork ||= "001-mvp";
	state.runtime = { status: "ready", currentAgent: "factory-discovery", pendingGate: null, approvals: [], startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
	writeFactoryState(cwd, state);
	appendFactoryEvent(cwd, { event: "pi-workflow-started", agent: "factory-discovery", work: state.activeWork });
	return state;
}

export function setCurrentAgent(cwd: string, agent: string) {
	const state = readFactoryState(cwd);
	if (!state) throw new Error("Factory Agent não está instalado.");
	state.runtime ||= { status: "ready", currentAgent: agent, pendingGate: null, approvals: [] };
	state.runtime.currentAgent = agent;
	state.runtime.updatedAt = new Date().toISOString();
	writeFactoryState(cwd, state);
}

export function recordDecision(cwd: string, decision: "approved" | "rejected", reason = "") {
	const state = readFactoryState(cwd);
	if (!state) throw new Error("Factory Agent não está instalado.");
	state.runtime ||= { status: "ready", currentAgent: getFactoryStatus(cwd).nextAgent, pendingGate: null, approvals: [] };
	const record = { agent: state.runtime.currentAgent, decision, reason, at: new Date().toISOString(), source: "pi-agent" };
	state.runtime.approvals = [...(state.runtime.approvals || []), record];
	state.runtime.pendingGate = null;
	state.runtime.status = decision === "approved" ? "ready" : "rejected";
	state.runtime.updatedAt = new Date().toISOString();
	writeFactoryState(cwd, state);
	appendFactoryEvent(cwd, { event: `pi-${decision}`, ...record });
	return record;
}
