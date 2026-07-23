import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Tree from "react-d3-tree";
import type {
	CustomNodeElementProps,
	TreeNodeDatum,
} from "react-d3-tree";
import type { HierarchyPointNode } from "d3-hierarchy";
import type { AstNode, Step } from "../../types";
import { buildRevealedTree, revealedNodeIdsUpTo } from "../../lib/astReveal";
import { findNodeById, locateNode } from "../../lib/astFocus";
import styles from "./AstView.module.css";

interface AstViewProps {
	ast: AstNode | null;
	steps: Step[];
	stepIndex: number;
	currentNodeId: number | null;
	errorNodeId: number | null;
	errorLine: number | null;
	hoveredNodeId: number | null;
	onHoverNode: (nodeId: number | null) => void;
}

const NODE_SIZE = { x: 130, y: 110 };
const SEPARATION = { siblings: 1.1, nonSiblings: 1.4 };
const SCALE_EXTENT = { min: 0.3, max: 2 };

function AstNodeElement(
	{ nodeDatum, toggleNode }: CustomNodeElementProps,
	currentNodeId: number | null,
	errorNodeId: number | null,
	hoveredNodeId: number | null,
	onHoverNode: (nodeId: number | null) => void,
) {
	const nodeId =
		typeof nodeDatum.attributes?.nodeId === "number"
			? nodeDatum.attributes.nodeId
			: null;
	const hasError = errorNodeId !== null && nodeId === errorNodeId;
	const isActive =
		!hasError && currentNodeId !== null && nodeId === currentNodeId;
	const isHovered =
		!hasError && !isActive && nodeId !== null && nodeId === hoveredNodeId;
	const isCollapsed =
		(nodeDatum.__rd3t.collapsed ?? false) &&
		(nodeDatum.children?.length ?? 0) > 0;
	const nodeClass = [
		styles.node,
		hasError ? styles.nodeError : "",
		isActive ? styles.nodeActive : "",
		isHovered ? styles.nodeHovered : "",
		isCollapsed ? styles.nodeCollapsed : "",
	].join(" ");

	const kind = String(nodeDatum.attributes?.kind ?? "");

	return (
		<g
			onClick={toggleNode}
			onMouseEnter={() => nodeId !== null && onHoverNode(nodeId)}
			onMouseLeave={() => onHoverNode(null)}
			className={nodeClass}
		>
			<circle r={40} className={styles.nodeShape} />
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
	currentNodeId,
	errorNodeId,
	errorLine,
	hoveredNodeId,
	onHoverNode,
}: Readonly<AstViewProps>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const treeRef = useRef<Tree>(null);
	const [translate, setTranslate] = useState({ x: 0, y: 0 });
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			setTranslate({ x: width / 2, y: 60 });
			setDimensions({ width, height });
		});
		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	const revealedIds = useMemo(
		() => revealedNodeIdsUpTo(steps, stepIndex),
		[steps, stepIndex],
	);

	const treeData = useMemo(
		() =>
			ast && ast.children.length > 0
				? buildRevealedTree(ast, revealedIds, errorNodeId, errorLine)
				: null,
		[ast, revealedIds, errorNodeId, errorLine],
	);

	const focusNodeId = errorNodeId ?? currentNodeId;

	useEffect(() => {
		if (!treeData || focusNodeId === null) return;
		if (!dimensions.width || !dimensions.height) return;
		const target = findNodeById(treeData, focusNodeId);
		if (!target) return;
		const point = locateNode(treeData, target, NODE_SIZE, SEPARATION);
		if (!point) return;
		treeRef.current?.centerNode(
			point as unknown as HierarchyPointNode<TreeNodeDatum>,
		);
	}, [treeData, focusNodeId, dimensions]);

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>Árvore do programa</h2>
			<div ref={containerRef} className={styles.treeContainer}>
				{treeData ? (
					<Tree
						ref={treeRef}
						data={treeData}
						orientation="vertical"
						translate={translate}
						dimensions={dimensions}
						collapsible
						zoomable
						zoom={0.9}
						scaleExtent={SCALE_EXTENT}
						separation={SEPARATION}
						nodeSize={NODE_SIZE}
						pathFunc="diagonal"
						transitionDuration={200}
						renderCustomNodeElement={(props) =>
							AstNodeElement(
								props,
								currentNodeId,
								errorNodeId,
								hoveredNodeId,
								onHoverNode,
							)
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
