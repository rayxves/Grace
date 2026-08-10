import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Puzzle, X } from "lucide-react";
import { CHALLENGES } from "../../content/challenges";
import { useRoute } from "../../hooks/useRoute";
import { useChallenge } from "../../hooks/useChallenge";
import styles from "./ChallengeGallery.module.css";

export function ChallengeGallery() {
	const { navigate } = useRoute();
	const { start } = useChallenge();
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);

	const close = () => {
		setOpen(false);
		triggerRef.current?.focus();
	};

	const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
		if (event.target === dialogRef.current) close();
	};

	const acceptChallenge = (challengeId: string) => {
		const challenge = CHALLENGES.find((c) => c.id === challengeId);
		if (!challenge) return;
		start(challenge);
		navigate("visualizer", null, challenge.code);
		close();
	};

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				className={styles.trigger}
				onClick={() => setOpen(true)}
			>
				<Puzzle size="1rem" />
				desafios
			</button>

			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-label="Desafios"
				onClose={close}
				onCancel={close}
				onClick={handleBackdropClick}
			>
				<div className={styles.header}>
					<h2 className={styles.title}>Desafios</h2>
					<button type="button" className={styles.closeButton} onClick={close} aria-label="fechar">
						<X size="1.125rem" />
					</button>
				</div>
				<p className={styles.subtitle}>
					Cada desafio existe para expor um comportamento do compilador ou da VM — não para
					ensinar sintaxe. Leia o código, responda a pergunta na sua cabeça, e só depois aceite
					o desafio para ver o passo a passo.
				</p>

				<div className={styles.grid}>
					{CHALLENGES.map((challenge) => (
						<article key={challenge.id} className={styles.card}>
							<h3 className={styles.cardTitle}>{challenge.title}</h3>
							<p className={styles.cardQuestion}>{challenge.question}</p>
							<pre className={styles.code}>{challenge.code}</pre>
							<button
								type="button"
								className={styles.acceptButton}
								onClick={() => acceptChallenge(challenge.id)}
							>
								aceitar o desafio
							</button>
						</article>
					))}
				</div>
			</dialog>
		</>
	);
}
