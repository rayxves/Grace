import { PHASES, type Phase } from "../../lib/phase";
import styles from "./PipelineStrip.module.css";

interface PipelineStripProps {
	phase: Phase;
	onSelect: (phase: Phase) => void;
}

export function PipelineStrip({ phase, onSelect }: Readonly<PipelineStripProps>) {
	return (
		<nav className={styles.strip} aria-label="fases do compilador">
			{PHASES.map((entry, i) => (
				<span key={entry.id} className={styles.phaseGroup}>
					<button
						type="button"
						className={entry.id === phase ? `${styles.phase} ${styles.phaseActive}` : styles.phase}
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
			))}
		</nav>
	);
}
