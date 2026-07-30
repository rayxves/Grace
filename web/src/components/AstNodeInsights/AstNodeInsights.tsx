import type { AstNode } from "../../types";
import { displayLabel } from "../../lib/astLabels";
import { explainPrecedence } from "../../lib/precedence";
import { describeScopeResolution, type ScopeResolution } from "../../lib/scopeLookup";
import { describeLineExpansion } from "../../lib/expansionStats";
import styles from "./AstNodeInsights.module.css";

interface AstNodeInsightsProps {
	node: AstNode | null;
	resolveMap: Map<number, ScopeResolution>;
	astCountsByLine: Map<number, number>;
	bytecodeCountsByLine: Map<number, number>;
}

const PRECEDENCE_KINDS = new Set(["Binary", "Logical"]);
const SCOPE_KINDS = new Set(["Variable", "Assign", "This", "Super"]);

export function AstNodeInsights({
	node,
	resolveMap,
	astCountsByLine,
	bytecodeCountsByLine,
}: Readonly<AstNodeInsightsProps>) {
	const symbol = node ? displayLabel(node.kind, node.label) : "";
	const precedenceHint =
		node && PRECEDENCE_KINDS.has(node.kind) ? explainPrecedence(symbol) : null;
	const scopeHint =
		node && SCOPE_KINDS.has(node.kind) && node.id !== null
			? describeScopeResolution(resolveMap.get(node.id))
			: null;
	const expansionHint = node
		? describeLineExpansion(node.line, astCountsByLine, bytecodeCountsByLine)
		: null;

	const insights = [
		precedenceHint && { label: "precedência", text: precedenceHint },
		scopeHint && { label: "escopo", text: scopeHint },
		expansionHint && { label: "expansão", text: expansionHint },
	].filter((entry): entry is { label: string; text: string } => Boolean(entry));

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>análise do nó</h2>
			<div className={styles.content}>
				{insights.length > 0 ? (
					insights.map((insight) => (
						<div key={insight.label} className={styles.insight}>
							<span className={styles.insightLabel}>{insight.label}</span>
							<p className={styles.insightText}>{insight.text}</p>
						</div>
					))
				) : (
					<div className={styles.empty}>
						<p className={styles.placeholder}>
							{node
								? "Este nó não tem uma explicação extra — tente uma variável, um operador ou uma comparação."
								: "Passe o mouse ou clique num nó da árvore para ver explicações de escopo, precedência e expansão."}
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
