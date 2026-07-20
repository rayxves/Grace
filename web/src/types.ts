export interface AstNode {
	id: number | null;
	kind: string;
	label: string;
	line: number | null;
	children: AstNode[];
}

export interface Step {
	line: number;
	instruction: string;
	stack: string[];
}

export interface Trace {
	ast: AstNode | null;
	steps: Step[];
	error: string | null;
}
