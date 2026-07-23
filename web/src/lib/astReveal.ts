import type { RawNodeDatum } from "react-d3-tree";
import type { AstNode } from "../types";
import { displayKind, displayLabel } from "./astLabels";

function qualifies(
	node: AstNode,
	revealedIds: Set<number>,
	errorNodeId: number | null,
	errorLine: number | null,
): boolean {
	if (node.id !== null && revealedIds.has(node.id)) return true;
	if (node.id !== null && errorNodeId !== null && node.id === errorNodeId) {
		return true;
	}
	if (errorNodeId === null && errorLine !== null && node.line === errorLine) {
		return true;
	}
	return false;
}

export function buildRevealedTree(
	node: AstNode,
	revealedIds: Set<number>,
	errorNodeId: number | null,
	errorLine: number | null,
): RawNodeDatum | null {
	const children = node.children
		.map((child) => buildRevealedTree(child, revealedIds, errorNodeId, errorLine))
		.filter((child): child is RawNodeDatum => child !== null);

	if (
		node.line !== null &&
		children.length === 0 &&
		!qualifies(node, revealedIds, errorNodeId, errorLine)
	) {
		return null;
	}

	return {
		name: displayLabel(node.kind, node.label),
		attributes: {
			kind: displayKind(node.kind),
			...(node.id !== null ? { nodeId: node.id } : {}),
			...(node.line !== null ? { line: node.line } : {}),
		},
		children,
	};
}

export function revealedNodeIdsUpTo(
	steps: { nodeId: number | null }[],
	index: number,
): Set<number> {
	const ids = new Set<number>();
	for (let i = 0; i <= index && i < steps.length; i++) {
		const nodeId = steps[i].nodeId;
		if (nodeId !== null) ids.add(nodeId);
	}
	return ids;
}
