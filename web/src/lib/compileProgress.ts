import type { BytecodeInstruction, CompileStep } from "../types";

export interface CompileProgress {
	currentNodeId: number | null;
	trailNodeIds: ReadonlySet<number>;
	revealedNodeIds: ReadonlySet<number>;
	depth: number;
}

export function computeCompileProgress(
	compileSteps: CompileStep[],
	index: number,
): CompileProgress {
	const stack: number[] = [];
	const revealed = new Set<number>();
	let currentNodeId: number | null = null;
	let trail: number[] = [];

	for (let i = 0; i <= index && i < compileSteps.length; i++) {
		const step = compileSteps[i];
		if (step.kind === "enter") {
			stack.push(step.nodeId);
			revealed.add(step.nodeId);
			currentNodeId = step.nodeId;
			trail = [...stack];
		} else if (step.kind === "exit") {
			currentNodeId = step.nodeId;
			trail = [...stack];
			if (stack[stack.length - 1] === step.nodeId) stack.pop();
		} else if (step.kind === "emit") {
			if (step.nodeId !== null) currentNodeId = step.nodeId;
			trail = [...stack];
		}
	}

	return {
		currentNodeId,
		trailNodeIds: new Set(trail),
		revealedNodeIds: revealed,
		depth: trail.length,
	};
}

export interface GrownInstruction extends BytecodeInstruction {
	pending: boolean;
}

const JUMP_OPCODES = new Set(["salta", "salta se falso"]);

export function growBytecodeUpTo(
	bytecode: BytecodeInstruction[],
	compileSteps: CompileStep[],
	index: number,
): GrownInstruction[] {
	const byOffset = new Map(bytecode.map((instr) => [instr.offset, instr]));
	const emittedOffsets: number[] = [];
	const patchedOpcodeOffsets = new Set<number>();

	for (let i = 0; i <= index && i < compileSteps.length; i++) {
		const step = compileSteps[i];
		if (step.kind === "emit") {
			emittedOffsets.push(step.offset);
		} else if (step.kind === "patch") {
			patchedOpcodeOffsets.add(step.offset - 1);
		}
	}

	return emittedOffsets.flatMap((offset) => {
		const instr = byOffset.get(offset);
		if (!instr) return [];
		const isJump = JUMP_OPCODES.has(instr.text.split(" para o byte")[0]);
		const pending = isJump && !patchedOpcodeOffsets.has(offset);
		return [
			{
				...instr,
				text: pending
					? `${instr.text.split(" para o byte")[0]} (destino ainda não definido)`
					: instr.text,
				pending,
			},
		];
	});
}
