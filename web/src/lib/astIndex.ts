import type { AstNode } from "../types";

export function buildAstNodeIndex(ast: AstNode | null): Map<number, AstNode> {
	const index = new Map<number, AstNode>();
	function walk(node: AstNode) {
		if (node.id !== null) index.set(node.id, node);
		for (const child of node.children) walk(child);
	}
	if (ast) walk(ast);
	return index;
}
