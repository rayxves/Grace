import type { ExpectedResult } from "./types";

export interface GalleryExample {
	id: string;
	title: string;
	question: string;
	code: string;
	expect: ExpectedResult;
}

export const GALLERY_EXAMPLES: GalleryExample[] = [
	{
		id: "maior-ou-igual",
		title: "Quantas instruções tem um >=?",
		question:
			"A VM tem instruções para < e para >, mas não para >=. Antes de rodar: quantas instruções você acha que o compilador gera para a >= b, e quais?",
		code: `var a = 5;
var b = 3;
imprima(a >= b);`,
		expect: { kind: "output", lines: ["Verdadeiro"] },
	},
	{
		id: "curto-circuito",
		title: "e / ou travam com uma divisão por zero?",
		question:
			"As duas linhas abaixo escondem uma divisão por zero dentro do lado direito de um e e de um ou. Isso deveria estourar um erro — ou será que o programa nem chega a avaliar aquele lado? Faça sua aposta antes de rodar.",
		code: `imprima(falso e (1 / 0));
imprima(verdadeiro ou (1 / 0));`,
		expect: { kind: "output", lines: ["Falso", "Verdadeiro"] },
	},
	{
		id: "atribuicao-isolada",
		title: "x = 5; sozinho na linha",
		question:
			"Essa linha não imprime nada nem guarda o resultado em lugar nenhum visível. Quantas instruções ela gera, e sobra algum valor esquecido na pilha depois da atribuição?",
		code: `var x = 0;
x = 5;`,
		expect: { kind: "output", lines: [] },
	},
	{
		id: "global-e-local",
		title: "O mesmo nome, dois lugares diferentes",
		question:
			"Existe um x fora da função e um x dentro dela. As duas leituras de x — a de dentro e a de fora — usam a mesma instrução? Observe o nome da instrução atual em cada passo, não só o valor impresso.",
		code: `var x = 1;
funcao f() {
	var x = 2;
	imprima(x);
}
f();
imprima(x);`,
		expect: { kind: "output", lines: ["2", "1"] },
	},
	{
		id: "laco-duas-voltas",
		title: "Um laço de duas voltas",
		question:
			"Este enquanto roda duas vezes. Quantas vezes o ip anda para trás durante a execução, e qual instrução faz isso acontecer?",
		code: `var i = 0;
enquanto (i < 2) {
	imprima(i);
	i = i + 1;
}`,
		expect: { kind: "output", lines: ["0", "1"] },
	},
];
