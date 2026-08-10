import { X } from "lucide-react";
import { useChallenge } from "../../hooks/useChallenge";
import styles from "./ChallengeBar.module.css";

export function ChallengeBar() {
	const { active, revealed, canReveal, reveal, dismiss } = useChallenge();

	if (!active) return null;

	return (
		<div className={styles.bar} role="region" aria-label="Desafio ativo">
			<div className={styles.text}>
				<span className={styles.label}>Desafio</span>
				<p className={styles.question}>{active.question}</p>
				{revealed && <p className={styles.answer}>{active.answer}</p>}
			</div>

			<div className={styles.actions}>
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
				<button
					type="button"
					className={styles.closeButton}
					onClick={dismiss}
					aria-label="fechar desafio"
				>
					<X size="1rem" />
				</button>
			</div>
		</div>
	);
}
