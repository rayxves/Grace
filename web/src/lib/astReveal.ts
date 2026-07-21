import type { RawNodeDatum } from "react-d3-tree";
import type { AstNode } from "../types";
import { displayKind, displayLabel } from "./astLabels";

function qualifies(
	node: AstNode,
	revealedLines: Set<number>,
	errorLine: number | null,
): boolean {
	if (node.line === null) return false;
	return revealedLines.has(node.line) || node.line === errorLine;
}

export function buildRevealedTree(
	node: AstNode,
	revealedLines: Set<number>,
	errorLine: number | null,
): RawNodeDatum | null {
	const children = node.children
		.map((child) => buildRevealedTree(child, revealedLines, errorLine))
		.filter((child): child is RawNodeDatum => child !== null);

	if (
		node.line !== null &&
		children.length === 0 &&
		!qualifies(node, revealedLines, errorLine)
	) {
		return null;
	}

	return {
		name: displayLabel(node.kind, node.label),
		attributes: {
			kind: displayKind(node.kind),
			...(node.line !== null ? { line: node.line } : {}),
		},
		children,
	};
}

export function revealedLinesUpTo(
	steps: { line: number }[],
	index: number,
): Set<number> {
	const lines = new Set<number>();
	for (let i = 0; i <= index && i < steps.length; i++) {
		lines.add(steps[i].line);
	}
	return lines;
}
