import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { readFactoryState } from "./state.ts";

export interface PolicyDecision {
	kind: "allow" | "confirm" | "block";
	reason: string;
}

interface FactoryPolicies {
	alwaysRequireApproval?: string[];
	forbiddenAutomaticActions?: string[];
}

const DEFAULT_POLICIES: Required<FactoryPolicies> = {
	alwaysRequireApproval: ["delete", "git-push", "deploy", "publish", "install-dependency", "database-migration", "modify-existing-application-file"],
	forbiddenAutomaticActions: ["force-push", "credential-write", "disable-tests"],
};

const SENSITIVE_PATH = /(^|\/)(\.git|\.env(?:\.|$)|node_modules|\.pi\/(?:extensions|skills)|\.factory\/(?:policies|manifest)\.json)(\/|$)/i;
const HARD_BLOCK_COMMANDS: Array<[string, RegExp]> = [
	["force-push", /\bgit\s+push\b[^\n]*(?:--force|-f\b)/i],
	["credential-write", /\bgit\s+config\b[^\n]*sslverify\s+false/i],
	["credential-write", /\b(?:set|export)\s+[A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY)\s*=/i],
	["disable-tests", /\b(?:skip|disable)[-_ ]?tests?\b/i],
];
const CONFIRM_COMMANDS: Array<[string, RegExp]> = [
	["delete", /\b(?:rm|rmdir|del)\b/i],
	["git-push", /\bgit\s+push\b/i],
	["install-dependency", /\b(?:npm|pnpm|yarn|pip|uv)\s+(?:install|add)\b/i],
	["deploy", /\bdeploy\b/i],
	["publish", /\b(?:publish|release)\b/i],
	["database-migration", /\b(?:migrate|migration)\b/i],
	["modify-existing-application-file", /\bdocker\s+(?:run|compose\s+up)\b/i],
	["modify-existing-application-file", /\b(?:sed\s+-i|tee|copy|cp|move|mv)\b/i],
	["modify-existing-application-file", /(?:>|>>)\s*[^|&]+/],
];

function loadPolicies(cwd: string): Required<FactoryPolicies> {
	const path = join(cwd, ".factory", "policies.json");
	if (!existsSync(path)) return DEFAULT_POLICIES;
	try {
		const value = JSON.parse(readFileSync(path, "utf8")) as FactoryPolicies;
		return {
			alwaysRequireApproval: Array.isArray(value.alwaysRequireApproval) ? value.alwaysRequireApproval : DEFAULT_POLICIES.alwaysRequireApproval,
			forbiddenAutomaticActions: Array.isArray(value.forbiddenAutomaticActions) ? value.forbiddenAutomaticActions : DEFAULT_POLICIES.forbiddenAutomaticActions,
		};
	} catch {
		return DEFAULT_POLICIES;
	}
}

function projectRelative(cwd: string, inputPath: string): string | null {
	const target = isAbsolute(inputPath) ? resolve(inputPath) : resolve(cwd, inputPath);
	const rel = relative(cwd, target).replaceAll("\\", "/");
	if (!rel || rel === ".." || rel.startsWith("../") || isAbsolute(rel)) return null;
	return rel;
}

function isPlanned(cwd: string, relativePath: string): boolean {
	const state = readFactoryState(cwd);
	if (!state?.activeWork) return false;
	const actions = join(cwd, state.folders.delivery, state.activeWork, "actions.md");
	return existsSync(actions) && readFileSync(actions, "utf8").replaceAll("\\", "/").includes(relativePath);
}

function hasPlanApproval(cwd: string): boolean {
	const approvals = readFactoryState(cwd)?.runtime?.approvals || [];
	return approvals.some((item) => item.agent === "factory-plan" && item.decision === "approved");
}

export function evaluateToolCall(cwd: string, toolName: string, input: Record<string, unknown>): PolicyDecision {
	const policies = loadPolicies(cwd);
	if (toolName === "bash") {
		const command = typeof input.command === "string" ? input.command : "";
		if (HARD_BLOCK_COMMANDS.some(([category, pattern]) => policies.forbiddenAutomaticActions.includes(category) && pattern.test(command))) return { kind: "block", reason: "comando proibido pela política do Factory Agent" };
		if (CONFIRM_COMMANDS.some(([category, pattern]) => policies.alwaysRequireApproval.includes(category) && pattern.test(command))) return { kind: "confirm", reason: "comando exige aprovação explícita" };
		return { kind: "allow", reason: "comando sem regra restritiva" };
	}
	if (toolName !== "write" && toolName !== "edit") return { kind: "allow", reason: "ferramenta não gerenciada" };
	const inputPath = typeof input.path === "string" ? input.path : "";
	const rel = projectRelative(cwd, inputPath);
	if (!rel) return { kind: "block", reason: "escrita fora da raiz do projeto" };
	if (SENSITIVE_PATH.test(rel)) return { kind: "block", reason: `caminho sensível protegido: ${rel}` };

	const state = readFactoryState(cwd);
	if (!state) return { kind: "block", reason: "Factory Agent não instalado" };
	const managedRoots = [".factory/", `${state.folders.product}/`, `${state.folders.delivery}/`, `${state.folders.operations}/`];
	if (managedRoots.some((root) => rel.startsWith(root))) return { kind: "allow", reason: "artefato interno do Factory Agent" };

	const agent = state.runtime?.currentAgent;
	if (agent !== "factory-developer" && agent !== "factory-bug-fix") {
		return { kind: "block", reason: `${agent || "agente atual"} não pode alterar código da aplicação` };
	}
	if (isPlanned(cwd, rel) && hasPlanApproval(cwd)) return { kind: "allow", reason: "arquivo previsto em plano aprovado" };
	if (policies.alwaysRequireApproval.includes("modify-existing-application-file")) {
		return { kind: "confirm", reason: `alteração de aplicação não comprovada pelo plano: ${rel}` };
	}
	return { kind: "block", reason: `alteração de aplicação fora do plano: ${rel}` };
}
