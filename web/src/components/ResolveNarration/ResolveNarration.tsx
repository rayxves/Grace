import type { ResolveStep } from "../../types";
import { explainResolveStep } from "../../lib/resolveNarration";
import styles from "./ResolveNarration.module.css";

interface ResolveNarrationProps {
	step: ResolveStep | null;
}

const KIND_LABELS: Record<ResolveStep["kind"], string> = {
	scopeBegin: "abriu escopo",
	scopeEnd: "fechou escopo",
	declare: "declarou",
	define: "definiu",
	resolve: "resolveu",
};

export function ResolveNarration({ step }: Readonly<ResolveNarrationProps>) {
	const explanation = step ? explainResolveStep(step) : null;

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>o que o resolvedor de escopos está fazendo</h2>
			<div className={styles.content}>
				{step && explanation ? (
					<>
						<span className={styles.badge}>{KIND_LABELS[step.kind]}</span>
						<p className={styles.summary}>{explanation.summary}</p>
					</>
				) : (
					<p className={styles.placeholder}>
						Avance um passo para acompanhar a resolução de escopos e variáveis
					</p>
				)}
			</div>
		</section>
	);
}
