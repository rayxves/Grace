import type { AstNode, BytecodeInstruction, Step } from "../types";

export function countAstNodesByLine(ast: AstNode | null): Map<number, number> {
	const counts = new Map<number, number>();
	function walk(node: AstNode) {
		if (node.line !== null) counts.set(node.line, (counts.get(node.line) ?? 0) + 1);
		for (const child of node.children) walk(child);
	}
	if (ast) walk(ast);
	return counts;
}

export function countBytecodeByLine(bytecode: BytecodeInstruction[]): Map<number, number> {
	const counts = new Map<number, number>();
	for (const instruction of bytecode) {
		counts.set(instruction.line, (counts.get(instruction.line) ?? 0) + 1);
	}
	return counts;
}

export function describeLineExpansion(
	line: number | null,
	astCountsByLine: Map<number, number>,
	bytecodeCountsByLine: Map<number, number>,
): string | null {
	if (line === null) return null;
	const nodeCount = astCountsByLine.get(line) ?? 0;
	const instructionCount = bytecodeCountsByLine.get(line) ?? 0;
	if (nodeCount === 0 && instructionCount === 0) return null;
	const nodeWord = nodeCount === 1 ? "nó" : "nós";
	const instructionWord = instructionCount === 1 ? "instrução" : "instruções";
	return `linha ${line} gerou ${nodeCount} ${nodeWord} de AST e ${instructionCount} ${instructionWord} de bytecode.`;
}

export function maxStackDepth(steps: Step[]): number {
	let max = 0;
	for (const step of steps) {
		if (step.stack.length > max) max = step.stack.length;
	}
	return max;
}
