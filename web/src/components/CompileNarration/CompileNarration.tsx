import type { AstNode, CompileStep } from "../../types";
import { explainCompileStep } from "../../lib/compileNarration";
import { nodeAccentColor } from "../../lib/nodeColor";
import styles from "./CompileNarration.module.css";

interface CompileNarrationProps {
	step: CompileStep | null;
	astIndex: Map<number, AstNode>;
	emitCountByNode: Map<number, number>;
}

const KIND_LABELS: Record<CompileStep["kind"], string> = {
	enter: "entrando no nó",
	exit: "saindo do nó",
	emit: "emitiu instrução",
	patch: "preencheu um salto",
};

function nodeIdOf(step: CompileStep): number | null {
	if (step.kind === "enter" || step.kind === "exit") return step.nodeId;
	if (step.kind === "emit") return step.nodeId;
	return null;
}

export function CompileNarration({
	step,
	astIndex,
	emitCountByNode,
}: Readonly<CompileNarrationProps>) {
	const explanation = step ? explainCompileStep(step, astIndex, emitCountByNode) : null;
	const nodeId = step ? nodeIdOf(step) : null;
	const accent = nodeAccentColor(nodeId);

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>o que o compilador está fazendo</h2>
			<div className={styles.content}>
				{step && explanation ? (
					<>
						<span
							className={styles.badge}
							style={accent ? { borderColor: accent, color: accent } : undefined}
						>
							{KIND_LABELS[step.kind]}
						</span>
						<p className={styles.summary}>{explanation.summary}</p>
					</>
				) : (
					<p className={styles.placeholder}>
						Avance um passo para acompanhar a compilação, nó por nó
					</p>
				)}
			</div>
		</section>
	);
}
