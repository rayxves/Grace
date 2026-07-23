import {
	StreamLanguage,
	HighlightStyle,
	syntaxHighlighting,
} from "@codemirror/language";
import {
	completeFromList,
	snippetCompletion,
	type Completion,
} from "@codemirror/autocomplete";
import { tags } from "@lezer/highlight";

const keywords = [
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
];

const keywordSet = new Set(keywords);

const graceStream = StreamLanguage.define({
	languageData: {
		commentTokens: { line: "//" },
		closeBrackets: { brackets: ["(", "[", "{", '"'] },
	},
	token(stream) {
		if (stream.eatSpace()) return null;
		if (stream.match("//")) {
			stream.skipToEnd();
			return "comment";
		}
		if (stream.match(/"([^"\\]|\\.)*"?/)) return "string";
		if (stream.match(/\d+(\.\d+)?/)) return "number";
		if (stream.match(/[A-Za-z_À-ÿ][\wÀ-ÿ]*/)) {
			return keywordSet.has(stream.current()) ? "keyword" : "variableName";
		}
		if (stream.match(/[+\-*/=<>!(){};,.]/)) return "punctuation";
		stream.next();
		return null;
	},
});

const graceHighlight = HighlightStyle.define([
	{ tag: tags.keyword, color: "var(--syntax-keyword)", fontWeight: "600" },
	{ tag: tags.string, color: "var(--syntax-string)" },
	{ tag: tags.number, color: "var(--syntax-number)" },
	{ tag: tags.comment, color: "var(--syntax-comment)", fontStyle: "italic" },
	{ tag: tags.variableName, color: "var(--syntax-variable)" },
	{ tag: tags.punctuation, color: "var(--syntax-punctuation)" },
]);

const snippets: Completion[] = [
	snippetCompletion("imprima(${valor});", {
		label: "imprima",
		detail: "exibe um valor",
		type: "function",
	}),
	snippetCompletion("var ${nome} = ${valor};", {
		label: "var",
		detail: "declara uma variável",
		type: "keyword",
	}),
	snippetCompletion("se (${condicao}) {\n\t${}\n}", {
		label: "se",
		detail: "bloco condicional",
		type: "keyword",
	}),
	snippetCompletion("se (${condicao}) {\n\t${}\n} senao {\n\t\n}", {
		label: "se senao",
		detail: "condicional com alternativa",
		type: "keyword",
	}),
	snippetCompletion("enquanto (${condicao}) {\n\t${}\n}", {
		label: "enquanto",
		detail: "laço de repetição",
		type: "keyword",
	}),
	snippetCompletion("funcao ${nome}(${}) {\n\t\n}", {
		label: "funcao",
		detail: "declara uma função",
		type: "function",
	}),
	snippetCompletion("classe ${Nome} {\n\t${}\n}", {
		label: "classe",
		detail: "declara uma classe",
		type: "class",
	}),
];

const snippetLabels = new Set(snippets.map((s) => s.label));

const keywordCompletions: Completion[] = keywords
	.filter((keyword) => !snippetLabels.has(keyword))
	.map((keyword) => ({ label: keyword, type: "keyword" }));

export const graceCompletions = completeFromList([
	...snippets,
	...keywordCompletions,
]);

export const graceLanguage = [graceStream, syntaxHighlighting(graceHighlight)];
