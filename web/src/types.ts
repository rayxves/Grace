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
}

export interface Step {
	offset: number;
	line: number;
	instruction: string;
	stack: string[];
}

export interface Trace {
	ast: AstNode | null;
	bytecode: BytecodeInstruction[];
	steps: Step[];
	error: string | null;
}
