import { useState } from "react";
import { Images, Play, X } from "lucide-react";
import { GALLERY_EXAMPLES } from "../../content/gallery";
import { useRoute } from "../../hooks/useRoute";
import styles from "./ExampleGallery.module.css";

export function ExampleGallery() {
	const { navigate } = useRoute();
	const [open, setOpen] = useState(false);
	const [selectedId, setSelectedId] = useState(GALLERY_EXAMPLES[0].id);

	const selected = GALLERY_EXAMPLES.find((example) => example.id === selectedId) ?? GALLERY_EXAMPLES[0];

	const runSelected = () => {
		navigate("visualizer", null, selected.code);
		setOpen(false);
	};

	return (
		<>
			<button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
				<Images size="1rem" />
				galeria de exemplos
			</button>

			{open && (
				<div className={styles.backdrop} onClick={() => setOpen(false)}>
					<div
						className={styles.dialog}
						role="dialog"
						aria-modal="true"
						aria-label="Galeria de exemplos"
						onClick={(event) => event.stopPropagation()}
					>
						<div className={styles.header}>
							<h2 className={styles.title}>Galeria de exemplos</h2>
							<button
								type="button"
								className={styles.closeButton}
								onClick={() => setOpen(false)}
								aria-label="fechar"
							>
								<X size="1.125rem" />
							</button>
						</div>
						<p className={styles.subtitle}>
							Cada exemplo existe para expor um comportamento do compilador ou da VM — não para
							ensinar sintaxe. Leia o código, responda a pergunta na sua cabeça, e só depois veja o
							passo a passo.
						</p>

						<div className={styles.body}>
							<nav className={styles.list} aria-label="exemplos da galeria">
								{GALLERY_EXAMPLES.map((example) => (
									<button
										key={example.id}
										type="button"
										className={
											example.id === selectedId
												? `${styles.listItem} ${styles.listItemActive}`
												: styles.listItem
										}
										onClick={() => setSelectedId(example.id)}
									>
										{example.title}
									</button>
								))}
							</nav>

							<div className={styles.detail}>
								<span className={styles.questionLabel}>Pergunta</span>
								<p className={styles.question}>{selected.question}</p>

								<span className={styles.codeLabel}>Programa</span>
								<pre className={styles.code}>{selected.code}</pre>

								<button type="button" className={styles.revealButton} onClick={runSelected}>
									<Play size="1rem" />
									ver o passo a passo
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
