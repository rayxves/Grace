export type Phase = "tokens" | "arvore" | "bytecode";

export const PHASES: { id: Phase; label: string }[] = [
	{ id: "tokens", label: "tokens" },
	{ id: "arvore", label: "árvore" },
	{ id: "bytecode", label: "bytecode" },
];

const PHASE_IDS: Set<string> = new Set(PHASES.map((entry) => entry.id));

export function isPhase(value: string | null | undefined): value is Phase {
	return value !== null && value !== undefined && PHASE_IDS.has(value);
}
