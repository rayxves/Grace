export type ExpectedResult =
	| { kind: "output"; lines: string[] }
	| { kind: "error" };

export interface VerifiedExample {
	id: string;
	title: string;
	code: string;
	expect: ExpectedResult;
}

export interface ReferenceItem {
	id: string;
	title: string;
	syntax?: string;
	description: string;
	whyItExists?: string;
	withoutIt?: string;
	example?: VerifiedExample;
	warning?: string;
	demonstratedError?: VerifiedExample;
}

export interface ReferenceSection {
	id: string;
	title: string;
	intro?: string;
	items: ReferenceItem[];
}
