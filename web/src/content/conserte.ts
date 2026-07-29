import type { Exercicio } from "./types";

export const conserte: Exercicio[] = [
	{
		id: "ponto-virgula",
		titulo: "Falta um ponto e vírgula",
		enunciado: "Este programa não compila. Leia a mensagem de erro e conserte.",
		codigoInicial: `var x = 10
imprima(x);
`,
		saidaEsperada: ["10"],
	},
	{
		id: "variavel-nao-declarada",
		titulo: "Variável não declarada",
		enunciado: 'Este programa usa uma variável que nunca foi criada. Declare mensagem com o valor "oi".',
		codigoInicial: `imprima(mensagem);
`,
		saidaEsperada: ["oi"],
	},
	{
		id: "atributo-nao-declarado",
		titulo: "Atributo não declarado",
		enunciado: "Esta classe usa um atributo que nunca foi declarado com var.",
		codigoInicial: `classe Contador {
	construtor(inicio) {
		este.valor = inicio;
	}
}
var c = Contador(5);
imprima(c.valor);
`,
		saidaEsperada: ["5"],
	},
	{
		id: "divisao-por-zero",
		titulo: "Divisão por zero",
		enunciado: "Este programa tenta dividir por zero. Troque partes por um valor que não seja zero e que dê 5 como resultado.",
		codigoInicial: `var total = 10;
var partes = 0;
imprima(total / partes);
`,
		saidaEsperada: ["5"],
	},
	{
		id: "texto-mais-numero",
		titulo: "Texto com número",
		enunciado:
			"Este programa tenta juntar texto com número usando +, o que não funciona no Grace. Ajuste para imprimir o texto e o número em dois imprima separados.",
		codigoInicial: `imprima("A nota foi: " + 10);
`,
		saidaEsperada: ["A nota foi:", "10"],
	},
];
