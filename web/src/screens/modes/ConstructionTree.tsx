import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Tree from "react-d3-tree";
import type { CustomNodeElementProps, TreeNodeDatum } from "react-d3-tree";
import type { HierarchyPointNode } from "d3-hierarchy";
import type { AstNode } from "../../types";
import { buildRevealedTree } from "../../lib/astReveal";
import { findNodeById, locateNode } from "../../lib/astFocus";
import { nodeAccentColor, nodeAccentFill } from "../../lib/nodeColor";
import { buildAstNodeIndex } from "../../lib/astIndex";
import { AstNodeShape } from "../../components/atoms/AstNodeShape";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import styles from "./ConstructionTree.module.css";

const NODE_SIZE = { x: 130, y: 110 };
const SEPARATION = { siblings: 1.1, nonSiblings: 1.4 };
const SCALE_EXTENT = { min: 0.3, max: 2 };

interface ConstructionTreeProps {
	ast: AstNode | null;
	revealedNodeIds: ReadonlySet<number>;
	currentNodeId: number | null;
	resolvedDepthByNode: ReadonlyMap<number, number>;
}

function ScopeBadge({ depth }: Readonly<{ depth: number }>) {
	return (
		<g transform="translate(30,-30)">
			<circle r={11} fill="var(--color-accent)" />
			<text textAnchor="middle" dy="0.35em" fontSize="10" fontWeight={700} fill="var(--color-on-accent)">
				{depth}
			</text>
		</g>
	);
}

function buildNodeRenderer(
	currentNodeId: number | null,
	resolvedDepthByNode: ReadonlyMap<number, number>,
	revealedNodeIds: ReadonlySet<number>,
	astById: Map<number, AstNode>,
) {
	return function renderNode({ nodeDatum }: CustomNodeElementProps) {
		const nodeId =
			typeof nodeDatum.attributes?.nodeId === "number" ? nodeDatum.attributes.nodeId : null;
		const isActive = nodeId !== null && nodeId === currentNodeId;
		const astNode = nodeId !== null ? astById.get(nodeId) : undefined;
		const isIncomplete =
			nodeId !== null &&
			!isActive &&
			(astNode?.children.some((child) => child.id !== null && !revealedNodeIds.has(child.id)) ?? false);
		const depth = nodeId !== null ? resolvedDepthByNode.get(nodeId) : undefined;
		const kind = String(nodeDatum.attributes?.kind ?? "");
		const line = typeof nodeDatum.attributes?.line === "number" ? nodeDatum.attributes.line : null;
		const accent = nodeAccentColor(nodeId);
		const accentFill = nodeAccentFill(nodeId);
		const lineSuffix = line !== null ? ` — linha ${line}` : "";
		const tooltip = `${nodeDatum.name} — ${kind}${lineSuffix}`;

		return (
			<AstNodeShape
				label={nodeDatum.name}
				kind={kind}
				nodeId={nodeId}
				accent={accent}
				accentFill={accentFill}
				isActive={isActive}
				isIncomplete={isIncomplete}
				tooltip={tooltip}
				badge={depth !== undefined ? <ScopeBadge depth={depth} /> : undefined}
			/>
		);
	};
}

export function ConstructionTree({
	ast,
	revealedNodeIds,
	currentNodeId,
	resolvedDepthByNode,
}: Readonly<ConstructionTreeProps>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const treeRef = useRef<Tree>(null);
	const [translate, setTranslate] = useState({ x: 0, y: 0 });
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const reducedMotion = usePrefersReducedMotion();

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

	const astById = useMemo(() => buildAstNodeIndex(ast), [ast]);

	const treeData = useMemo(
		() => (ast ? buildRevealedTree(ast, revealedNodeIds, null, null) : null),
		[ast, revealedNodeIds],
	);

	useEffect(() => {
		if (reducedMotion) return;
		if (!treeData || currentNodeId === null) return;
		if (!dimensions.width || !dimensions.height) return;
		const target = findNodeById(treeData, currentNodeId);
		if (!target) return;
		const point = locateNode(treeData, target, NODE_SIZE, SEPARATION);
		if (!point) return;
		treeRef.current?.centerNode(point as unknown as HierarchyPointNode<TreeNodeDatum>);
	}, [treeData, currentNodeId, dimensions, reducedMotion]);

	const renderNode = useMemo(
		() => buildNodeRenderer(currentNodeId, resolvedDepthByNode, revealedNodeIds, astById),
		[currentNodeId, resolvedDepthByNode, revealedNodeIds, astById],
	);

	return (
		<div ref={containerRef} className={styles.treeContainer}>
			{treeData && (
				<Tree
					ref={treeRef}
					data={treeData}
					orientation="vertical"
					translate={translate}
					dimensions={dimensions}
					zoomable
					zoom={0.9}
					scaleExtent={SCALE_EXTENT}
					separation={SEPARATION}
					nodeSize={NODE_SIZE}
					pathFunc="diagonal"
					transitionDuration={reducedMotion ? 0 : 200}
					renderCustomNodeElement={renderNode}
				/>
			)}
		</div>
	);
}
