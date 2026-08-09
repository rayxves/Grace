import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PHASES, type Phase } from "../../lib/phase";
import { PHASE_NARRATION } from "../../content/phaseNarration";
import { useRoute } from "../../hooks/useRoute";
import styles from "./PipelineStrip.module.css";

interface PipelineStripProps {
	phase: Phase;
	onSelect: (phase: Phase) => void;
}

export function PipelineStrip({ phase, onSelect }: Readonly<PipelineStripProps>) {
	const [expanded, setExpanded] = useState(false);
	const { navigate } = useRoute();
	const narration = PHASE_NARRATION[phase];

	return (
		<div className={styles.wrapper}>
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

			<div className={styles.narration}>
				<button
					type="button"
					className={styles.toggle}
					aria-expanded={expanded}
					onClick={() => setExpanded((value) => !value)}
				>
					{expanded ? "ocultar" : "entenda esta fase"}
					{expanded ? <ChevronUp size="0.875rem" /> : <ChevronDown size="0.875rem" />}
				</button>

				{expanded && (
					<div className={styles.narrationBody}>
						<p>{narration.text}</p>
						<div className={styles.narrationLinks}>
							{narration.links.map((link) => (
								<button
									key={link.itemId}
									type="button"
									className={styles.narrationLink}
									onClick={() => navigate("reference", `maquina.${link.itemId}`)}
								>
									{link.label} na Referência →
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
