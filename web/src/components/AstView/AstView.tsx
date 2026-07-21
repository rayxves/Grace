import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Tree from "react-d3-tree";
import type { CustomNodeElementProps } from "react-d3-tree";
import type { AstNode, Step } from "../../types";
import { buildRevealedTree, revealedLinesUpTo } from "../../lib/astReveal";
import styles from "./AstView.module.css";

interface AstViewProps {
	ast: AstNode | null;
	steps: Step[];
	stepIndex: number;
	currentLine: number | null;
	errorLine: number | null;
}

function AstNodeElement(
	{ nodeDatum, toggleNode }: CustomNodeElementProps,
	currentLine: number | null,
	errorLine: number | null,
) {
	const nodeLine = nodeDatum.attributes?.line;
	const hasError = errorLine !== null && nodeLine === errorLine;
	const isActive =
		!hasError && currentLine !== null && nodeLine === currentLine;
	const isCollapsed =
		(nodeDatum.__rd3t.collapsed ?? false) &&
		(nodeDatum.children?.length ?? 0) > 0;
	const nodeClass = [
		styles.node,
		hasError ? styles.nodeError : "",
		isActive ? styles.nodeActive : "",
		isCollapsed ? styles.nodeCollapsed : "",
	].join(" ");

	const kind = String(nodeDatum.attributes?.kind ?? "");

	return (
		<g onClick={toggleNode} className={nodeClass}>
			<circle r={35} className={styles.nodeShape} />
			<text dy="0.35em" textAnchor="middle" className={styles.nodeLabel}>
				{nodeDatum.name}
			</text>
			{kind !== nodeDatum.name && (
				<text dy="4em" textAnchor="middle" className={styles.nodeKind}>
					{kind}
				</text>
			)}
		</g>
	);
}

export function AstView({
	ast,
	steps,
	stepIndex,
	currentLine,
	errorLine,
}: Readonly<AstViewProps>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [translate, setTranslate] = useState({ x: 0, y: 0 });

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const observer = new ResizeObserver(([entry]) => {
			setTranslate({ x: entry.contentRect.width / 2, y: 60 });
		});
		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	const revealedLines = useMemo(
		() => revealedLinesUpTo(steps, stepIndex),
		[steps, stepIndex],
	);

	const treeData = useMemo(
		() => (ast ? buildRevealedTree(ast, revealedLines, errorLine) : null),
		[ast, revealedLines, errorLine],
	);

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>árvore do programa</h2>
			<div ref={containerRef} className={styles.treeContainer}>
				{treeData ? (
					<Tree
						data={treeData}
						orientation="vertical"
						translate={translate}
						collapsible
						zoomable
						zoom={0.8}
						separation={{ siblings: 1.1, nonSiblings: 1.4 }}
						nodeSize={{ x: 110, y: 90 }}
						pathFunc="diagonal"
						transitionDuration={200}
						renderCustomNodeElement={(props) =>
							AstNodeElement(props, currentLine, errorLine)
						}
					/>
				) : (
					<p className={styles.placeholder}>
						Execute um programa para ver sua árvore sintática
					</p>
				)}
			</div>
		</section>
	);
}
