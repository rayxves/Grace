import type { BytecodeInstruction } from "../types";

export function buildNodeLineMap(
	bytecode: BytecodeInstruction[],
): Map<number, number> {
	const map = new Map<number, number>();
	for (const instruction of bytecode) {
		if (instruction.nodeId !== null && !map.has(instruction.nodeId)) {
			map.set(instruction.nodeId, instruction.line);
		}
	}
	return map;
}

export function findNodeIdByOffset(
	bytecode: BytecodeInstruction[],
	offset: number | null,
): number | null {
	if (offset === null) return null;
	return (
		bytecode.find((instruction) => instruction.offset === offset)?.nodeId ??
		null
	);
}
