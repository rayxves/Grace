import type { AstNode } from "../../types";
import { displayKind, displayLabel } from "../../lib/astLabels";
import { Panel } from "../Panel/Panel";
import styles from "./AstNodeInspector.module.css";

interface AstNodeInspectorProps {
	node: AstNode | null;
	statusLabel: string;
}

export function AstNodeInspector({ node, statusLabel }: Readonly<AstNodeInspectorProps>) {
	return (
		<Panel
			title="inspetor de nó"
			panelClassName={styles.panel}
			contentClassName={styles.content}
			badge={node ? statusLabel : undefined}
			isEmpty={!node}
			placeholder="Passe o mouse ou clique num nó da árvore para inspecionar. Clicar fixa o destaque até você clicar em outro nó."
		>
			{node && (
				<dl className={styles.fields}>
					<div className={styles.field}>
						<dt>tipo</dt>
						<dd>{displayKind(node.kind)}</dd>
					</div>
					<div className={styles.field}>
						<dt>rótulo</dt>
						<dd>{displayLabel(node.kind, node.label) || "—"}</dd>
					</div>
					<div className={styles.field}>
						<dt>linha</dt>
						<dd>{node.line ?? "—"}</dd>
					</div>
					<div className={styles.field}>
						<dt>filhos</dt>
						<dd>{node.children.length}</dd>
					</div>
				</dl>
			)}
		</Panel>
	);
}
