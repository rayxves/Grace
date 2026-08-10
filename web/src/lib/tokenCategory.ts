import type { TokenCategory } from "../types";

export const TOKEN_CATEGORY_ORDER: TokenCategory[] = [
	"keyword",
	"identifier",
	"number",
	"string",
	"boolean",
	"operator",
	"punctuation",
];

export const TOKEN_CATEGORY_LABELS: Record<TokenCategory, string> = {
	keyword: "palavra-chave",
	identifier: "identificador",
	number: "número",
	string: "texto",
	boolean: "lógico",
	operator: "operador",
	punctuation: "pontuação",
};

export const TOKEN_CATEGORY_COLOR_VAR: Record<TokenCategory, string> = {
	keyword: "var(--syntax-keyword)",
	boolean: "var(--syntax-keyword)",
	identifier: "var(--syntax-variable)",
	number: "var(--syntax-number)",
	string: "var(--syntax-string)",
	operator: "var(--syntax-punctuation)",
	punctuation: "var(--syntax-punctuation)",
};
