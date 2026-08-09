import type { Phase } from "../lib/phase";

export interface PhaseNarrationLink {
	label: string;
	itemId: string;
}

export interface PhaseNarration {
	entra: string;
	sai: string;
	decisao: string;
	links: PhaseNarrationLink[];
}

export const PHASE_NARRATION: Record<Phase, PhaseNarration> = {
	tokens: {
		entra: "texto-fonte",
		sai: "lista de tokens",
		decisao:
			"Separar 'que caracteres formam esta unidade' de 'como as unidades se combinam' evita responder as duas perguntas ao mesmo tempo — o parser trabalha sobre unidades já classificadas, sem decidir de novo onde um número termina ou se '>=' é um ou dois operadores.",
		links: [{ label: "Token", itemId: "token" }],
	},
	arvore: {
		entra: "lista de tokens",
		sai: "árvore sintática (AST) já resolvida",
		decisao:
			"A precedência dos operadores é a própria forma da árvore, não uma regra reaplicada a cada leitura do código. A resolução de escopos roda antes de qualquer bytecode existir, checando cada uso de variável dentro de blocos e funções.",
		links: [
			{ label: "Árvore sintática (AST)", itemId: "ast" },
			{ label: "Resolução de escopos", itemId: "resolucao-de-escopos" },
		],
	},
	bytecode: {
		entra: "árvore resolvida",
		sai: "bytecode e o resultado de executá-lo",
		decisao:
			"Toda expressão deixa exatamente um valor na pilha e todo comando devolve a pilha como a encontrou — é isso que explica instruções como 'descarta topo' que não correspondem a nada escrito no programa-fonte.",
		links: [
			{ label: "Bytecode", itemId: "bytecode" },
			{ label: "Pilha de valores", itemId: "pilha-de-valores" },
		],
	},
};
