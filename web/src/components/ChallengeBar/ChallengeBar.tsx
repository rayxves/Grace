import { AnimatePresence, motion } from "framer-motion";
import { Puzzle, X } from "lucide-react";
import { useChallenge } from "../../hooks/useChallenge";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import styles from "./ChallengeBar.module.css";

export function ChallengeBar() {
	const { active, revealed, canReveal, reveal, dismiss } = useChallenge();
	const reducedMotion = usePrefersReducedMotion();

	if (!active) return null;

	return (
		<section className={styles.bar} aria-label="Desafio ativo">
			<div className={styles.content}>
				<div className={styles.textRow}>
					<Puzzle size="1rem" className={styles.icon} aria-hidden="true" />
					<span className={styles.title}>{active.title}</span>
					<p className={styles.question}>{active.question}</p>
					{!revealed && (
						<button
							type="button"
							className={styles.revealButton}
							onClick={reveal}
							disabled={!canReveal}
							title={canReveal ? undefined : "avance pelo menos um passo para revelar a resposta"}
						>
							revelar resposta
						</button>
					)}
				</div>

				<AnimatePresence initial={false}>
					{revealed && (
						<motion.div
							initial={reducedMotion ? false : { height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
							transition={{ duration: reducedMotion ? 0 : 0.2 }}
							className={styles.answerWrapper}
						>
							<div className={styles.answerBlock}>
								<span className={styles.answerLabel}>resposta</span>
								<p className={styles.answer}>{active.answer}</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<button type="button" className={styles.closeButton} onClick={dismiss} aria-label="fechar desafio">
				<X size="1rem" />
			</button>
		</section>
	);
}
