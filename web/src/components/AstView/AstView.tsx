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
import { nodeAccentColor, nodeAccentFill } from "../../lib/nodeColor";
import { Panel } from "../Panel/Panel";
import { AstNodeShape } from "../atoms/AstNodeShape";
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
	onSelectNode?: (nodeId: number | null) => void;
	trailNodeIds?: ReadonlySet<number> | null;
	revealedNodeIds?: ReadonlySet<number> | null;
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
	onSelectNode: ((nodeId: number | null) => void) | undefined,
	trailNodeIds: ReadonlySet<number> | null,
) {
	const nodeId =
		typeof nodeDatum.attributes?.nodeId === "number"
			? nodeDatum.attributes.nodeId
			: null;
	const hasError = errorNodeId !== null && nodeId === errorNodeId;
	const isActive =
		!hasError && currentNodeId !== null && nodeId === currentNodeId;
	const isTrail =
		!hasError &&
		!isActive &&
		nodeId !== null &&
		(trailNodeIds?.has(nodeId) ?? false);
	const isHovered =
		!hasError && !isActive && nodeId !== null && nodeId === hoveredNodeId;
	const isCollapsed =
		(nodeDatum.__rd3t.collapsed ?? false) &&
		(nodeDatum.children?.length ?? 0) > 0;

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
			hasError={hasError}
			isActive={isActive}
			isTrail={isTrail}
			isHovered={isHovered}
			isCollapsed={isCollapsed}
			tooltip={tooltip}
			onClick={() => {
				toggleNode();
				onSelectNode?.(nodeId);
			}}
			onMouseEnter={() => nodeId !== null && onHoverNode(nodeId)}
			onMouseLeave={() => onHoverNode(null)}
		/>
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
	onSelectNode,
	trailNodeIds = null,
	revealedNodeIds = null,
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

	const computedRevealedIds = useMemo(
		() => revealedNodeIdsUpTo(steps, stepIndex),
		[steps, stepIndex],
	);
	const revealedIds = revealedNodeIds ?? computedRevealedIds;

	const treeData = useMemo(
		() =>
			ast && ast.children.length > 0
				? buildRevealedTree(ast, revealedIds, errorNodeId, errorLine)
				: null,
		[ast, revealedIds, errorNodeId, errorLine],
	);

	const focusNodeId = errorNodeId ?? currentNodeId;
	const previousFocusNodeId = useRef<number | null>(null);

	useEffect(() => {
		const previous = previousFocusNodeId.current;
		previousFocusNodeId.current = focusNodeId;
		if (previous === null) return;
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
		<Panel
			title="Árvore do programa"
			titleClassName={styles.title}
			dataRole="ast-panel"
			caption={
				treeData
					? "Cada nó tem uma cor própria, a mesma cor aparece nas linhas de bytecode que ele gerou."
					: undefined
			}
			contentClassName={styles.treeContainer}
			contentRef={containerRef}
			isEmpty={!treeData}
			placeholder="Execute um programa para ver sua árvore sintática"
			placeholderClassName={styles.placeholder}
		>
			{treeData && (
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
							onSelectNode,
							trailNodeIds,
						)
					}
				/>
			)}
		</Panel>
	);
}
