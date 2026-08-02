import type { AstNode, BytecodeInstruction } from "../types";

function collectSubtreeNodeIds(node: AstNode, ids: Set<number>) {
	if (node.id !== null) ids.add(node.id);
	for (const child of node.children) collectSubtreeNodeIds(child, ids);
}

export function findFunctionNode(ast: AstNode | null, functionName: string): AstNode | null {
	if (!ast) return null;
	function walk(node: AstNode): AstNode | null {
		if (node.kind === "Function" && node.label === functionName) return node;
		for (const child of node.children) {
			const found = walk(child);
			if (found) return found;
		}
		return null;
	}
	return walk(ast);
}

export interface OffsetRange {
	min: number;
	max: number;
}

export function functionBytecodeRange(
	functionNode: AstNode,
	bytecode: BytecodeInstruction[],
): OffsetRange | null {
	const ids = new Set<number>();
	collectSubtreeNodeIds(functionNode, ids);
	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (const instruction of bytecode) {
		if (instruction.nodeId !== null && ids.has(instruction.nodeId)) {
			min = Math.min(min, instruction.offset);
			max = Math.max(max, instruction.offset);
		}
	}
	if (min > max) return null;
	return { min, max };
}
