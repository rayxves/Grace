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

export interface Variable {
	name: string;
	value: string;
}

export interface CallStackEntry {
	functionName: string;
	callLine: number | null;
}

export interface Step {
	offset: number;
	line: number;
	nodeId: number | null;
	loopIteration: number | null;
	instruction: string;
	stack: string[];
	popped: string[];
	pushed: string[];
	globals: Variable[];
	locals: Variable[];
	callStack: CallStackEntry[];
}

export type CompileStep =
	| { kind: "enter"; nodeId: number; nodeKind: string; line: number | null }
	| { kind: "exit"; nodeId: number }
	| { kind: "emit"; nodeId: number | null; offset: number; opcode: string; line: number }
	| { kind: "patch"; offset: number; target: number };

export interface TokenInfo {
	text: string;
	kind: string;
	line: number;
}

export interface Trace {
	ast: AstNode | null;
	bytecode: BytecodeInstruction[];
	steps: Step[];
	compileSteps: CompileStep[];
	tokens: TokenInfo[];
	error: string | null;
	errorOffset: number | null;
}
