import type { Phase } from "../lib/phase";

export interface PhaseNarrationLink {
	label: string;
	itemId: string;
}

export interface PhaseNarration {
	text: string;
	links: PhaseNarrationLink[];
}

export const PHASE_NARRATION: Record<Phase, PhaseNarration> = {
	tokens: {
		text: "Entra o texto-fonte, caractere a caractere. Sai uma lista de tokens — a menor unidade com sentido léxico: números, nomes, palavras-chave, operadores, pontuação. A decisão de projeto aqui é separar 'que caracteres formam esta unidade' de 'como as unidades se combinam', para que o parser não precise, a cada regra da gramática, decidir de novo onde um número termina ou se '>=' é um operador só ou dois.",
		links: [{ label: "Token", itemId: "token" }],
	},
	arvore: {
		text: "Entra a lista de tokens. Sai uma árvore sintática (AST) já com a resolução de escopos aplicada sobre ela: antes de qualquer bytecode existir, cada uso de variável dentro de um bloco ou função é checado — não pode se referir a si mesma no próprio inicializador, nem ser declarada duas vezes no mesmo escopo. A decisão de projeto é que a precedência dos operadores é a própria forma da árvore, não uma regra reaplicada a cada leitura do código.",
		links: [
			{ label: "Árvore sintática (AST)", itemId: "ast" },
			{ label: "Resolução de escopos", itemId: "resolucao-de-escopos" },
		],
	},
	bytecode: {
		text: "Entra a árvore resolvida. Saem duas coisas: o bytecode que o compilador emite — uma sequência linear de instruções — e o resultado de executar esse bytecode na VM de pilha, passo a passo. A decisão de projeto é que toda expressão deixa exatamente um valor na pilha e todo comando devolve a pilha como a encontrou; é isso que explica instruções como 'descarta topo' que não correspondem a nada escrito no programa-fonte.",
		links: [
			{ label: "Bytecode", itemId: "bytecode" },
			{ label: "Pilha de valores", itemId: "pilha-de-valores" },
		],
	},
};
