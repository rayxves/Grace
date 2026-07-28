import { useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Play, Target } from "lucide-react";
import { licoes } from "../content/licoes";
import { useRoute } from "../hooks/useRoute";
import styles from "./Aprender.module.css";

export function Aprender() {
	const { navigate } = useRoute();
	const [selectedId, setSelectedId] = useState(licoes[0].id);

	const index = licoes.findIndex((licao) => licao.id === selectedId);
	const licao = licoes[index];
	const anterior = licoes[index - 1] ?? null;
	const proxima = licoes[index + 1] ?? null;

	const experimentar = (code: string) => navigate("visualizador", null, code);

	return (
		<div className={styles.screen}>
			<nav className={styles.sidebar} aria-label="lições">
				{licoes.map((item) => (
					<button
						key={item.id}
						type="button"
						className={
							item.id === selectedId ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
						}
						onClick={() => setSelectedId(item.id)}
					>
						<span className={styles.navNumero}>{item.numero}</span>
						{item.titulo}
					</button>
				))}
			</nav>

			<div className={styles.content}>
				<article className={styles.lesson}>
					<header className={styles.lessonHeader}>
						<span className={styles.lessonProgress}>
							Lição {licao.numero} de {licoes.length}
						</span>
						<h1 className={styles.lessonTitle}>{licao.titulo}</h1>
						<code className={styles.lessonSyntax}>{licao.sintaxe}</code>
					</header>

					{licao.conceito.map((paragrafo) => (
						<p key={paragrafo} className={styles.paragraph}>
							{paragrafo}
						</p>
					))}

					<section className={styles.exampleBlock}>
						<h2 className={styles.exampleTitle}>{licao.exemplo.title}</h2>
						<pre className={styles.code}>{licao.exemplo.code}</pre>
						<button
							type="button"
							className={styles.experimentar}
							onClick={() => experimentar(licao.exemplo.code)}
						>
							<Play size="1rem" />
							experimentar
						</button>
					</section>

					{licao.aviso && (
						<div className={styles.aviso}>
							<AlertTriangle size="1.125rem" className={styles.avisoIcon} />
							<p className={styles.avisoText}>{licao.aviso}</p>
						</div>
					)}

					{licao.erroDemonstrado && (
						<section className={styles.errorBlock}>
							<h2 className={styles.exampleTitle}>{licao.erroDemonstrado.title}</h2>
							<pre className={styles.code}>{licao.erroDemonstrado.code}</pre>
							<button
								type="button"
								className={styles.experimentar}
								onClick={() => experimentar(licao.erroDemonstrado!.code)}
							>
								<Play size="1rem" />
								ver o erro no visualizador
							</button>
						</section>
					)}

					{licao.desafio && (
						<div className={styles.desafio}>
							<Target size="1.125rem" className={styles.desafioIcon} />
							<div>
								<span className={styles.desafioLabel}>Agora tente você</span>
								<p className={styles.desafioText}>{licao.desafio}</p>
							</div>
						</div>
					)}
				</article>

				<div className={styles.pager}>
					<button
						type="button"
						className={styles.pagerButton}
						disabled={!anterior}
						onClick={() => anterior && setSelectedId(anterior.id)}
					>
						<ChevronLeft size="1rem" />
						{anterior ? anterior.titulo : "início"}
					</button>
					<button
						type="button"
						className={styles.pagerButton}
						disabled={!proxima}
						onClick={() => proxima && setSelectedId(proxima.id)}
					>
						{proxima ? proxima.titulo : "fim"}
						<ChevronRight size="1rem" />
					</button>
				</div>
			</div>
		</div>
	);
}
