import type { AstNode } from "../../types";
import { displayKind, displayLabel } from "../../lib/astLabels";
import styles from "./AstNodeInspector.module.css";

interface AstNodeInspectorProps {
	node: AstNode | null;
	statusLabel: string;
}

export function AstNodeInspector({ node, statusLabel }: Readonly<AstNodeInspectorProps>) {
	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>inspetor de nó</h2>
			<div className={styles.content}>
				{node ? (
					<>
						<span className={styles.badge}>{statusLabel}</span>
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
					</>
				) : (
					<div className={styles.empty}>
						<p className={styles.placeholder}>
							Passe o mouse ou clique num nó da árvore para inspecionar. Clicar fixa o
							destaque até você clicar em outro nó.
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
