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
		question: "A VM não tem uma instrução para >=. Quantas instruções você acha que a >= b gera?",
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
		question: "As linhas abaixo escondem uma divisão por zero. Isso trava o programa?",
		code: `imprima(falso e (1 / 0));
imprima(verdadeiro ou (1 / 0));`,
		answer:
			"Não trava. O salto do e/ou pula direto para depois do lado direito quando o resultado já está decidido, então a divisão nunca chega a ser executada.",
		expect: { kind: "output", lines: ["Falso", "Verdadeiro"] },
	},
	{
		id: "atribuicao-isolada",
		title: "x = 5; sozinho na linha",
		question: "x = 5; sozinho na linha. Quantas instruções isso gera?",
		code: `var x = 0;
x = 5;`,
		answer:
			"Duas — atribui global x, seguida de descarta topo. atribui global não desempilha; o comando isolado precisa descartar o valor sozinho.",
		expect: { kind: "output", lines: [] },
	},
	{
		id: "global-e-local",
		title: "O mesmo nome, dois lugares diferentes",
		question: "Um x fora da função, outro dentro. As duas leituras usam a mesma instrução?",
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
		question: "Este laço roda duas vezes. Quantas vezes o ip volta para trás?",
		code: `var i = 0;
enquanto (i < 2) {
	imprima(i);
	i = i + 1;
}`,
		answer: "Duas vezes. A instrução volta (laço) move o ip para trás ao final de cada iteração bem-sucedida.",
		expect: { kind: "output", lines: ["0", "1"] },
	},
];
