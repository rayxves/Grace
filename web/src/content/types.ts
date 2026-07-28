export type ExpectedResult =
	| { kind: "output"; lines: string[] }
	| { kind: "error" };

export interface VerifiedExample {
	id: string;
	title: string;
	code: string;
	expect: ExpectedResult;
}

export interface Topic {
	id: string;
	title: string;
	description: string;
	examples: VerifiedExample[];
}
