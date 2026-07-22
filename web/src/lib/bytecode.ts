import type { BytecodeInstruction } from "../types";

export interface BytecodeLineGroup {
	line: number;
	instructions: BytecodeInstruction[];
}

export function groupBytecodeByLine(
	bytecode: BytecodeInstruction[],
): BytecodeLineGroup[] {
	const groups: BytecodeLineGroup[] = [];
	for (const instruction of bytecode) {
		const last = groups.at(-1);
		if (last && last.line === instruction.line) {
			last.instructions.push(instruction);
		} else {
			groups.push({ line: instruction.line, instructions: [instruction] });
		}
	}
	return groups;
}
