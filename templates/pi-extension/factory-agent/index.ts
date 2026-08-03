import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Type } from "typebox";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { evaluateToolCall } from "./policy.ts";
import { getFactoryStatus, readFactoryState, recordDecision, setCurrentAgent, startPiWorkflow } from "./state.ts";

const STATUS_KEY = "factory-agent";

function renderStatus(ctx: ExtensionContext) {
	const status = getFactoryStatus(ctx.cwd);
	const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "sem modelo";
	const text = status.installed ? `Factory: ${status.stage} · ${status.nextAgent || "concluído"} · ${model}` : "Factory: não instalado";
	ctx.ui.setStatus(STATUS_KEY, ctx.ui.theme.fg(status.installed ? "accent" : "warning", text));
	return status;
}

function sendAgent(pi: ExtensionAPI, ctx: ExtensionContext, agent?: string | null) {
	if (!agent) {
		ctx.ui.notify("Workflow concluído ou sem próximo agente.", "info");
		return;
	}
	setCurrentAgent(ctx.cwd, agent);
	pi.sendUserMessage(
		`Ative a skill ${agent} instalada neste projeto. Leia .factory/state.json e os artefatos físicos, execute somente a responsabilidade dessa skill e respeite todos os gates.`,
		{ deliverAs: "followUp" },
	);
	ctx.ui.notify(`Encaminhado para ${agent}.`, "info");
}

async function registerProjectOllama(pi: ExtensionAPI) {
	if (process.env.PI_OFFLINE === "1") return;
	const path = join(process.cwd(), ".factory", "providers.json");
	if (!existsSync(path)) return;
	try {
		const config = JSON.parse(readFileSync(path, "utf8")) as { providers?: { ollama?: { enabled?: boolean; baseUrl?: string; timeoutMs?: number } } };
		const ollama = config.providers?.ollama;
		if (!ollama?.enabled) return;
		const base = (ollama.baseUrl || "http://127.0.0.1:11434").replace(/\/$/, "").replace(/\/v1$/, "");
		const response = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(Math.min(ollama.timeoutMs || 3000, 3000)) });
		if (!response.ok) return;
		const payload = await response.json() as { models?: Array<{ name?: string; model?: string; details?: { family?: string; context_length?: number } }> };
		const models = (payload.models || [])
			.map((item) => ({ id: item.name || item.model, family: item.details?.family || "", contextWindow: item.details?.context_length || 32768 }))
			.filter((item): item is { id: string; family: string; contextWindow: number } => Boolean(item.id) && !/(?:embed|bert)/i.test(`${item.id} ${item.family}`));
		if (!models.length) return;
		pi.registerProvider("factory-ollama", {
			baseUrl: `${base}/v1`,
			apiKey: "ollama-local",
			api: "openai-completions",
			models: models.map((model) => ({
				id: model.id,
				name: `Ollama: ${model.id}`,
				reasoning: false,
				input: ["text"],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: model.contextWindow,
				maxTokens: Math.min(8192, Math.max(2048, Math.floor(model.contextWindow / 4))),
			})),
		});
	} catch {
		// Ollama é opcional; indisponibilidade não impede o carregamento da extensão.
	}
}

export default async function factoryAgentExtension(pi: ExtensionAPI) {
	await registerProjectOllama(pi);
	let enabled = true;

	pi.registerCommand("factory", {
		description: "Mostra o status da fábrica de software",
		handler: async (_args, ctx) => {
			const status = renderStatus(ctx);
			ctx.ui.notify(`${status.stage}: ${status.reason}${status.nextAgent ? `; próximo ${status.nextAgent}` : ""}`, status.installed ? "info" : "warning");
		},
	});

	pi.registerCommand("factory-extension", {
		description: "Ativa, desativa ou mostra a extensão Factory Agent",
		handler: async (args, ctx) => {
			const option = args.trim().toLowerCase();
			if (option === "on") enabled = true;
			else if (option === "off") enabled = false;
			else if (option && option !== "status") {
				ctx.ui.notify("Uso: /factory-extension [on|off|status]", "warning");
				return;
			}
			if (!enabled) ctx.ui.setStatus(STATUS_KEY, undefined);
			else renderStatus(ctx);
			ctx.ui.notify(`Factory Agent: ${enabled ? "ativado" : "desativado"}`, "info");
		},
	});

	pi.registerCommand("factory-new", {
		description: "Inicia um projeto: /factory-new <ideia>",
		handler: async (args, ctx) => {
			if (!enabled) return ctx.ui.notify("Extensão Factory Agent desativada.", "warning");
			try {
				startPiWorkflow(ctx.cwd, args);
				renderStatus(ctx);
				sendAgent(pi, ctx, "factory-discovery");
			} catch (error) {
				ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
			}
		},
	});

	for (const [name, description] of [
		["factory-run", "Executa o próximo agente físico"],
		["factory-resume", "Retoma o workflow pelo estado físico"],
	] as const) {
		pi.registerCommand(name, {
			description,
			handler: async (args, ctx) => {
				if (!enabled) return ctx.ui.notify("Extensão Factory Agent desativada.", "warning");
				const status = renderStatus(ctx);
				const requested = args.trim() || status.nextAgent;
				if (args.trim() && status.nextAgent && args.trim() !== status.nextAgent) {
					ctx.ui.notify(`Próximo agente físico é ${status.nextAgent}.`, "warning");
					return;
				}
				sendAgent(pi, ctx, requested);
			},
		});
	}

	pi.registerCommand("factory-approve", {
		description: "Registra aprovação humana para o estágio atual",
		handler: async (args, ctx) => {
			try {
				const ok = await ctx.ui.confirm("Aprovar estágio", `Confirma a aprovação de ${getFactoryStatus(ctx.cwd).nextAgent || "estágio atual"}?`);
				if (!ok) return;
				const decision = recordDecision(ctx.cwd, "approved", args.trim());
				pi.appendEntry("factory-decision", decision);
				renderStatus(ctx);
				pi.sendUserMessage(`Aprovação humana registrada para ${decision.agent}. Continue respeitando o próximo estágio físico.`, { deliverAs: "followUp" });
			} catch (error) {
				ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
			}
		},
	});

	pi.registerCommand("factory-reject", {
		description: "Rejeita o estágio atual com justificativa",
		handler: async (args, ctx) => {
			if (!args.trim()) return ctx.ui.notify("Informe o motivo da rejeição.", "warning");
			const decision = recordDecision(ctx.cwd, "rejected", args.trim());
			pi.appendEntry("factory-decision", decision);
			ctx.ui.notify(`Estágio rejeitado: ${args.trim()}`, "warning");
			renderStatus(ctx);
		},
	});

	pi.registerCommand("factory-provider", {
		description: "Mostra o provider e modelo ativos no Pi",
		handler: async (_args, ctx) => {
			ctx.ui.notify(ctx.model ? `Modelo ativo: ${ctx.model.provider}/${ctx.model.id}` : "Nenhum modelo ativo.", ctx.model ? "info" : "warning");
		},
	});

	pi.registerCommand("factory-import-reversa", {
		description: "Importa uma extracao Reversa: /factory-import-reversa <caminho-legado>",
		handler: async (args, ctx) => {
			const source = args.trim();
			if (!source) return ctx.ui.notify("Informe o caminho do sistema legado.", "warning");
			const confirmed = await ctx.ui.confirm("Reversa Bridge", `Importar snapshot somente leitura de ${source}?`);
			if (!confirmed) return;
			const result = await pi.exec("factory", ["import", "reversa", `--source=${source}`, `--root=${ctx.cwd}`], { cwd: ctx.cwd });
			ctx.ui.notify(result.code === 0 ? result.stdout.trim() : result.stderr.trim() || "Falha na importacao Reversa.", result.code === 0 ? "info" : "error");
			renderStatus(ctx);
		},
	});

	pi.registerCommand("factory-new-from-reversa", {
		description: "Inicia a reconstrucao usando o snapshot Reversa ativo",
		handler: async (_args, ctx) => {
			const result = await pi.exec("factory", ["new", "--from-reversa", `--root=${ctx.cwd}`], { cwd: ctx.cwd });
			if (result.code !== 0) return ctx.ui.notify(result.stderr.trim() || "Falha ao iniciar reconstrucao.", "error");
			renderStatus(ctx);
			sendAgent(pi, ctx, "factory-reversa-curator");
		},
	});

	pi.registerCommand("factory-doctor", {
		description: "Verifica a instalação local do Factory Agent",
		handler: async (_args, ctx) => {
			const state = readFactoryState(ctx.cwd);
			const issues = [
				!state && ".factory/state.json ausente",
				!existsSync(join(ctx.cwd, ".agents", "skills", "factory-new", "SKILL.md")) && "skill factory-new ausente",
				!existsSync(join(ctx.cwd, ".pi", "extensions", "factory-agent", "index.ts")) && "extensão local ausente",
			].filter(Boolean);
			ctx.ui.notify(issues.length ? issues.join("; ") : "Factory Agent íntegro no projeto.", issues.length ? "warning" : "info");
		},
	});

	pi.registerTool({
		name: "factory_status",
		label: "Factory Status",
		description: "Consulta o estágio físico e o próximo agente do Factory Agent.",
		parameters: Type.Object({}),
		async execute(_id, _params, _signal, _update, ctx) {
			const status = getFactoryStatus(ctx.cwd);
			return { content: [{ type: "text", text: JSON.stringify(status, null, 2) }], details: status };
		},
	});

	pi.registerTool({
		name: "factory_import_reversa",
		label: "Factory Reversa Import",
		description: "Importa uma extracao Reversa ja gerada. Nunca executa o Reversa nem modifica o legado.",
		parameters: Type.Object({ source: Type.String({ description: "Caminho absoluto ou relativo da raiz legada" }) }),
		async execute(_id, params, _signal, _update, ctx) {
			const confirmed = await ctx.ui.confirm("Reversa Bridge", `Importar snapshot somente leitura de ${params.source}?`);
			if (!confirmed) return { content: [{ type: "text", text: "Importacao cancelada pelo usuario." }], details: { imported: false }, isError: true };
			const result = await pi.exec("factory", ["import", "reversa", `--source=${params.source}`, `--root=${ctx.cwd}`], { cwd: ctx.cwd });
			return { content: [{ type: "text", text: result.stdout.trim() || result.stderr.trim() }], details: { imported: result.code === 0, exitCode: result.code }, isError: result.code !== 0 };
		},
	});

	pi.registerTool({
		name: "factory_start_from_reversa",
		label: "Factory Reversa Start",
		description: "Inicia reconstrucao a partir do snapshot Reversa ativo apos confirmacao humana.",
		parameters: Type.Object({}),
		async execute(_id, _params, _signal, _update, ctx) {
			const confirmed = await ctx.ui.confirm("Reversa Bridge", "Iniciar o workflow de reconstrucao?");
			if (!confirmed) return { content: [{ type: "text", text: "Inicio cancelado pelo usuario." }], details: { started: false }, isError: true };
			const result = await pi.exec("factory", ["new", "--from-reversa", `--root=${ctx.cwd}`], { cwd: ctx.cwd });
			return { content: [{ type: "text", text: result.stdout.trim() || result.stderr.trim() }], details: { started: result.code === 0, exitCode: result.code }, isError: result.code !== 0 };
		},
	});

	pi.registerTool({
		name: "factory_record_decision",
		label: "Factory Decision",
		description: "Registra uma decisão já expressamente dada pelo usuário. Nunca decide pelo usuário.",
		parameters: Type.Object({
			decision: Type.Union([Type.Literal("approved"), Type.Literal("rejected")]),
			reason: Type.Optional(Type.String()),
		}),
		async execute(_id, params, _signal, _update, ctx) {
			const confirmed = await ctx.ui.confirm(
				"Factory Decision Gate",
				`O modelo solicitou registrar ${params.decision} para ${getFactoryStatus(ctx.cwd).nextAgent || "o estágio atual"}. Confirma?`,
			);
			if (!confirmed) {
				return { content: [{ type: "text", text: "Decisão não confirmada pelo usuário." }], details: { recorded: false }, isError: true };
			}
			const record = recordDecision(ctx.cwd, params.decision, params.reason || "");
			pi.appendEntry("factory-decision", record);
			return { content: [{ type: "text", text: JSON.stringify(record) }], details: { recorded: true, ...record } };
		},
	});

	pi.on("tool_call", async (event, ctx) => {
		if (!enabled) return;
		const decision = evaluateToolCall(ctx.cwd, event.toolName, event.input as Record<string, unknown>);
		if (decision.kind === "block") return { block: true, reason: decision.reason };
		if (decision.kind === "confirm") {
			const allowed = await ctx.ui.confirm("Factory Policy Gate", `${decision.reason}\n\nFerramenta: ${event.toolName}`);
			if (!allowed) return { block: true, reason: "Operação recusada pelo usuário." };
		}
	});

	pi.on("session_start", (_event, ctx) => { if (enabled) renderStatus(ctx); });
	pi.on("model_select", (_event, ctx) => { if (enabled) renderStatus(ctx); });
	pi.on("tool_execution_end", (_event, ctx) => { if (enabled) renderStatus(ctx); });
	pi.on("session_shutdown", (_event, ctx) => ctx.ui.setStatus(STATUS_KEY, undefined));
}
