import type { ResolveStep } from "../types";

export interface ScopeResolution {
	name: string;
	depth: number;
}

export function buildScopeResolutionMap(resolveSteps: ResolveStep[]): Map<number, ScopeResolution> {
	const map = new Map<number, ScopeResolution>();
	for (const step of resolveSteps) {
		if (step.kind === "resolve") {
			map.set(step.id, { name: step.name, depth: step.depth });
		}
	}
	return map;
}

export function describeScopeResolution(resolution: ScopeResolution | undefined): string {
	if (!resolution) {
		return "variável global — não passa por resolução de escopo léxico (Grace resolve globais dinamicamente, em tempo de execução).";
	}
	if (resolution.depth === 0) {
		return "resolvida no próprio escopo local onde foi usada.";
	}
	if (resolution.depth === 1) {
		return "resolvida 1 nível de escopo acima de onde foi usada.";
	}
	return `resolvida ${resolution.depth} níveis de escopo acima de onde foi usada.`;
}
