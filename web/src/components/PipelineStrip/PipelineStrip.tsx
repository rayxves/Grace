import { useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PHASES, type Phase } from "../../lib/phase";
import { PHASE_NARRATION } from "../../content/phaseNarration";
import { useRoute } from "../../hooks/useRoute";
import { useDismiss } from "../../hooks/useDismiss";
import styles from "./PipelineStrip.module.css";

interface PipelineStripProps {
	phase: Phase;
	onSelect: (phase: Phase) => void;
}

export function PipelineStrip({ phase, onSelect }: Readonly<PipelineStripProps>) {
	const [open, setOpen] = useState(false);
	const { navigate } = useRoute();
	const narration = PHASE_NARRATION[phase];
	const anchorRef = useRef<HTMLDivElement>(null);

	useDismiss(anchorRef, open, () => setOpen(false));

	return (
		<div className={styles.row}>
			<nav className={styles.strip} aria-label="fases do compilador">
				{PHASES.map((entry, i) => (
					<span key={entry.id} className={styles.phaseGroup}>
						<button
							type="button"
							className={
								entry.id === phase ? `${styles.phase} ${styles.phaseActive}` : styles.phase
							}
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

			<span className={styles.divider} aria-hidden="true" />

			<div className={styles.flow}>
				<span>{narration.entra}</span>
				<span className={styles.flowArrow} aria-hidden="true">
					→
				</span>
				<span>{narration.sai}</span>
			</div>

			<span className={styles.divider} aria-hidden="true" />

			<div className={styles.popoverAnchor} ref={anchorRef}>
				<button
					type="button"
					className={styles.toggle}
					aria-expanded={open}
					onClick={() => setOpen((value) => !value)}
				>
					decisão de projeto
					{open ? <ChevronUp size="0.875rem" /> : <ChevronDown size="0.875rem" />}
				</button>

				{open && (
					<div className={styles.popover}>
						<p>{narration.decisao}</p>
						<div className={styles.narrationLinks}>
							{narration.links.map((link) => (
								<button
									key={link.itemId}
									type="button"
									className={styles.narrationLink}
									onClick={() => {
										setOpen(false);
										navigate("reference", `maquina.${link.itemId}`);
									}}
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
