import styles from "./PipelineStrip.module.css";

export type Phase = "tokens" | "arvore" | "bytecode" | "execucao";

interface PipelineStripProps {
	phase: Phase;
	compiling: boolean;
	onSelect: (phase: Phase) => void;
}

const PHASES: { id: Phase; label: string }[] = [
	{ id: "tokens", label: "tokens" },
	{ id: "arvore", label: "árvore" },
	{ id: "bytecode", label: "bytecode" },
	{ id: "execucao", label: "execução" },
];

const PHASE_IDS: Set<string> = new Set(PHASES.map((entry) => entry.id));

export function isPhase(value: string | null | undefined): value is Phase {
	return value !== null && value !== undefined && PHASE_IDS.has(value);
}

export function PipelineStrip({
	phase,
	compiling,
	onSelect,
}: Readonly<PipelineStripProps>) {
	return (
		<nav className={styles.strip} aria-label="fases do compilador">
			{PHASES.map((entry, i) => {
				const isCompiling =
					compiling &&
					(entry.id === "arvore" || entry.id === "bytecode") &&
					(phase === entry.id || phase === "execucao");
				const isActive = entry.id === phase;
				const className = [
					styles.phase,
					isActive ? styles.phaseActive : "",
					isCompiling ? styles.phaseCompiling : "",
				].join(" ");
				return (
					<span key={entry.id} className={styles.phaseGroup}>
						<button
							type="button"
							className={className}
							onClick={() => onSelect(entry.id)}
						>
							{entry.label}
						</button>
						{i < PHASES.length - 1 && (
							<span className={styles.arrow} aria-hidden="true">
								→
							</span>
						)}
					</span>
				);
			})}
		</nav>
	);
}
