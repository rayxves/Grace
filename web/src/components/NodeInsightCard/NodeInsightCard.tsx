import type { AstNode } from "../../types";
import { displayKind, displayLabel } from "../../lib/astLabels";
import { explainPrecedence } from "../../lib/precedence";
import { describeScopeResolution, type ScopeResolution } from "../../lib/scopeLookup";
import { describeLineExpansion } from "../../lib/expansionStats";
import styles from "./NodeInsightCard.module.css";

interface NodeInsightCardProps {
	node: AstNode;
	resolveMap: Map<number, ScopeResolution>;
	astCountsByLine: Map<number, number>;
	bytecodeCountsByLine: Map<number, number>;
}

const PRECEDENCE_KINDS = new Set(["Binary", "Logical"]);
const SCOPE_KINDS = new Set(["Variable", "Assign", "This", "Super"]);

export function NodeInsightCard({
	node,
	resolveMap,
	astCountsByLine,
	bytecodeCountsByLine,
}: Readonly<NodeInsightCardProps>) {
	const symbol = displayLabel(node.kind, node.label);
	const precedenceHint = PRECEDENCE_KINDS.has(node.kind) ? explainPrecedence(symbol) : null;
	const scopeHint =
		SCOPE_KINDS.has(node.kind) && node.id !== null
			? describeScopeResolution(resolveMap.get(node.id))
			: null;
	const expansionHint = describeLineExpansion(node.line, astCountsByLine, bytecodeCountsByLine);

	const insights = [
		precedenceHint && { label: "precedência", text: precedenceHint },
		scopeHint && { label: "escopo", text: scopeHint },
		expansionHint && { label: "expansão", text: expansionHint },
	].filter((entry): entry is { label: string; text: string } => Boolean(entry));

	if (insights.length === 0) return null;

	return (
		<div className={styles.card}>
			<span className={styles.title}>
				{symbol} <span className={styles.kind}>{displayKind(node.kind)}</span>
			</span>
			{insights.map((insight) => (
				<div key={insight.label} className={styles.insight}>
					<span className={styles.insightLabel}>{insight.label}</span>
					<p className={styles.insightText}>{insight.text}</p>
				</div>
			))}
		</div>
	);
}
