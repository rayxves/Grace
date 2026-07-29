import type { ResolveStep } from "../types";

export interface ResolveStepExplanation {
	summary: string;
}

function ordinalNiveis(depth: number): string {
	if (depth === 0) return "no próprio escopo onde foi usada";
	if (depth === 1) return "1 nível de escopo acima";
	return `${depth} níveis de escopo acima`;
}

export function explainResolveStep(step: ResolveStep): ResolveStepExplanation {
	switch (step.kind) {
		case "scopeBegin":
			return { summary: "abriu um novo escopo (entrou num bloco, função ou classe)" };
		case "scopeEnd":
			return { summary: "fechou o escopo atual — as variáveis declaradas nele deixam de existir" };
		case "declare":
			return {
				summary: `declarou a variável "${step.name}" neste escopo (ainda sem valor pronto)`,
			};
		case "define":
			return {
				summary: `terminou de inicializar "${step.name}" — a partir de agora ela pode ser lida`,
			};
		case "resolve":
			return {
				summary: `encontrou a variável "${step.name}" ${ordinalNiveis(step.depth)}`,
			};
		default:
			return { summary: "" };
	}
}
