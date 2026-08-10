const KEYWORDS = new Set([
	"var",
	"se",
	"senao",
	"retorna",
	"enquanto",
	"para",
	"imprima",
	"nulo",
	"classe",
	"funcao",
	"ou",
	"e",
	"super",
	"este",
	"verdadeiro",
	"falso",
	"construtor",
]);

export type HighlightKind =
	| "comment"
	| "string"
	| "number"
	| "keyword"
	| "identifier"
	| "punctuation"
	| "plain";

export interface HighlightToken {
	text: string;
	kind: HighlightKind;
}

const WHITESPACE = /^\s+/;
const STRING = /^"([^"\\]|\\.)*"?/;
const NUMBER = /^\d+(\.\d+)?/;
const IDENTIFIER = /^[A-Za-z_À-ÿ][\wÀ-ÿ]*/;
const PUNCTUATION = /^[+\-*/=<>!(){};,.]/;

function highlightLine(line: string): HighlightToken[] {
	const tokens: HighlightToken[] = [];
	let rest = line;

	while (rest.length > 0) {
		if (rest.startsWith("//")) {
			tokens.push({ text: rest, kind: "comment" });
			break;
		}

		const whitespace = WHITESPACE.exec(rest);
		if (whitespace) {
			tokens.push({ text: whitespace[0], kind: "plain" });
			rest = rest.slice(whitespace[0].length);
			continue;
		}

		const string = STRING.exec(rest);
		if (string) {
			tokens.push({ text: string[0], kind: "string" });
			rest = rest.slice(string[0].length);
			continue;
		}

		const number = NUMBER.exec(rest);
		if (number) {
			tokens.push({ text: number[0], kind: "number" });
			rest = rest.slice(number[0].length);
			continue;
		}

		const identifier = IDENTIFIER.exec(rest);
		if (identifier) {
			tokens.push({ text: identifier[0], kind: KEYWORDS.has(identifier[0]) ? "keyword" : "identifier" });
			rest = rest.slice(identifier[0].length);
			continue;
		}

		const punctuation = PUNCTUATION.exec(rest);
		if (punctuation) {
			tokens.push({ text: punctuation[0], kind: "punctuation" });
			rest = rest.slice(punctuation[0].length);
			continue;
		}

		tokens.push({ text: rest[0], kind: "plain" });
		rest = rest.slice(1);
	}

	return tokens;
}

export function highlightSource(source: string): HighlightToken[][] {
	return source.split("\n").map(highlightLine);
}

export const HIGHLIGHT_COLOR_VAR: Record<HighlightKind, string> = {
	comment: "var(--syntax-comment)",
	string: "var(--syntax-string)",
	number: "var(--syntax-number)",
	keyword: "var(--syntax-keyword)",
	identifier: "var(--syntax-variable)",
	punctuation: "var(--syntax-punctuation)",
	plain: "inherit",
};
