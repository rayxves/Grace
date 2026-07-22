export interface AstNode {
	id: number | null;
	kind: string;
	label: string;
	line: number | null;
	children: AstNode[];
}

export interface BytecodeInstruction {
	offset: number;
	text: string;
	line: number;
	nodeId: number | null;
}

export interface Step {
	offset: number;
	line: number;
	nodeId: number | null;
	instruction: string;
	stack: string[];
	popped: string[];
	pushed: string[];
}

export interface Trace {
	ast: AstNode | null;
	bytecode: BytecodeInstruction[];
	steps: Step[];
	error: string | null;
	errorOffset: number | null;
}
