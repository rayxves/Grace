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

export type ResolveStep =
	| { kind: "scopeBegin" }
	| { kind: "scopeEnd" }
	| { kind: "declare"; name: string; line: number }
	| { kind: "define"; name: string }
	| { kind: "resolve"; id: number; name: string; depth: number };

export type TokenCategory =
	| "keyword"
	| "identifier"
	| "number"
	| "string"
	| "boolean"
	| "operator"
	| "punctuation";

export interface TokenInfo {
	text: string;
	kind: string;
	category: TokenCategory;
	line: number;
}

export interface Trace {
	ast: AstNode | null;
	bytecode: BytecodeInstruction[];
	constants: string[];
	steps: Step[];
	resolveSteps: ResolveStep[];
	compileSteps: CompileStep[];
	tokens: TokenInfo[];
	error: string | null;
	errorOffset: number | null;
	truncated: boolean;
}
