import type { ExpectedResult } from "./types";

export interface Challenge {
	id: string;
	title: string;
	question: string;
	code: string;
	answer: string;
	expect: ExpectedResult;
}

export const CHALLENGES: Challenge[] = [
	{
		id: "maior-ou-igual",
		title: "Quantas instruções tem um >=?",
		question:
			"A VM tem instruções para < e para >, mas não para >=. Antes de rodar: quantas instruções você acha que o compilador gera para a >= b, e quais?",
		code: `var a = 5;
var b = 3;
imprima(a >= b);`,
		answer:
			"Duas — menor, seguida de nega lógico. A VM não tem >=: ela compara com < e nega o resultado.",
		expect: { kind: "output", lines: ["Verdadeiro"] },
	},
	{
		id: "curto-circuito",
		title: "e / ou travam com uma divisão por zero?",
		question:
			"As duas linhas abaixo escondem uma divisão por zero dentro do lado direito de um e e de um ou. Isso deveria estourar um erro — ou será que o programa nem chega a avaliar aquele lado? Faça sua aposta antes de rodar.",
		code: `imprima(falso e (1 / 0));
imprima(verdadeiro ou (1 / 0));`,
		answer:
			"Não trava. O salto do e/ou pula direto para depois do lado direito quando o resultado já está decidido, então a divisão nunca chega a ser executada.",
		expect: { kind: "output", lines: ["Falso", "Verdadeiro"] },
	},
	{
		id: "atribuicao-isolada",
		title: "x = 5; sozinho na linha",
		question:
			"Essa linha não imprime nada nem guarda o resultado em lugar nenhum visível. Quantas instruções ela gera, e sobra algum valor esquecido na pilha depois da atribuição?",
		code: `var x = 0;
x = 5;`,
		answer:
			"Duas — atribui global x, seguida de descarta topo. atribui global não desempilha; o comando isolado precisa descartar o valor sozinho.",
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
		answer:
			"Não. Dentro da função, x vira lê local (por slot); fora dela, lê global (por nome, no pool de constantes).",
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
		answer: "Duas vezes. A instrução volta (laço) move o ip para trás ao final de cada iteração bem-sucedida.",
		expect: { kind: "output", lines: ["0", "1"] },
	},
];
