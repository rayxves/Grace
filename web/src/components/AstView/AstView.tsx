import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { GitBranch } from "lucide-react";
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
import type { ScopeResolution } from "../../lib/scopeLookup";
import { Panel } from "../Panel/Panel";
import { AstNodeShape } from "../atoms/AstNodeShape";
import { NodeInsightCard } from "../NodeInsightCard/NodeInsightCard";
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
	pinnedNode?: AstNode | null;
	resolveMap?: Map<number, ScopeResolution>;
	astCountsByLine?: Map<number, number>;
	bytecodeCountsByLine?: Map<number, number>;
	run: () => void;
	running: boolean;
}

const EMPTY_RESOLVE_MAP = new Map<number, ScopeResolution>();
const EMPTY_COUNTS_MAP = new Map<number, number>();

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
	pinnedNode = null,
	resolveMap = EMPTY_RESOLVE_MAP,
	astCountsByLine = EMPTY_COUNTS_MAP,
	bytecodeCountsByLine = EMPTY_COUNTS_MAP,
	run,
	running,
}: Readonly<AstViewProps>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const treeRef = useRef<Tree>(null);
	const [translate, setTranslate] = useState({ x: 0, y: 0 });
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [annotationPosition, setAnnotationPosition] = useState<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const pinnedNodeId = pinnedNode?.id ?? null;
		if (pinnedNodeId === null) return;
		let frame: number;
		const update = () => {
			const container = containerRef.current;
			const nodeEl = container?.querySelector(`[data-node-id="${pinnedNodeId}"]`);
			if (container && nodeEl) {
				const containerRect = container.getBoundingClientRect();
				const nodeRect = nodeEl.getBoundingClientRect();
				setAnnotationPosition({
					x: nodeRect.left + nodeRect.width / 2 - containerRect.left,
					y: nodeRect.top - containerRect.top,
				});
			}
			frame = requestAnimationFrame(update);
		};
		frame = requestAnimationFrame(update);
		return () => cancelAnimationFrame(frame);
	}, [pinnedNode]);

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
			contentClassName={styles.treeContainer}
			contentRef={containerRef}
			isEmpty={!treeData}
			emptyIcon={<GitBranch size="1.5rem" />}
			placeholder="A árvore sintática aparece aqui depois da análise"
			emptyActionLabel="executar"
			onEmptyAction={run}
			emptyActionDisabled={running}
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
			{pinnedNode && annotationPosition && (
				<div
					className={styles.annotation}
					style={{ left: annotationPosition.x, top: annotationPosition.y }}
				>
					<NodeInsightCard
						node={pinnedNode}
						resolveMap={resolveMap}
						astCountsByLine={astCountsByLine}
						bytecodeCountsByLine={bytecodeCountsByLine}
					/>
				</div>
			)}
		</Panel>
	);
}
