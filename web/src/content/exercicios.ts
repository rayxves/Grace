import type { Exercicio } from "./types";

export const exercicios: Exercicio[] = [
	{
		id: "um-a-dez",
		titulo: "Contar de 1 a 10",
		enunciado: "Imprima os números de 1 a 10, um por linha.",
		codigoInicial: `// escreva um laço que imprime de 1 até 10
`,
		saidaEsperada: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
	},
	{
		id: "dobro",
		titulo: "Dobro de um número",
		enunciado: "Escreva uma função dobro(n) que devolve o dobro de n.",
		codigoInicial: `funcao dobro(n) {
	// escreva aqui
}

imprima(dobro(5));
imprima(dobro(10));
`,
		saidaEsperada: ["10", "20"],
	},
	{
		id: "pares",
		titulo: "Números pares",
		enunciado:
			"Imprima apenas os números pares de 1 a 20, um por linha. Dica: o Grace não tem um operador de resto — tente alternar um valor verdadeiro/falso a cada volta do laço.",
		codigoInicial: `para (var i = 1; i <= 20; i = i + 1) {
	// escreva aqui
}
`,
		saidaEsperada: ["2", "4", "6", "8", "10", "12", "14", "16", "18", "20"],
	},
	{
		id: "fatorial",
		titulo: "Fatorial",
		enunciado: "Escreva uma função fatorial(n) que calcula o fatorial de n.",
		codigoInicial: `funcao fatorial(n) {
	// escreva aqui
}

imprima(fatorial(5));
`,
		saidaEsperada: ["120"],
	},
	{
		id: "comparar",
		titulo: "Maior que 10",
		enunciado:
			'A variável numero já está definida. Imprima "maior" se ela for maior que 10, e "menor" caso contrário.',
		codigoInicial: `var numero = 15;
// escreva o se/senao aqui
`,
		saidaEsperada: ["maior"],
	},
	{
		id: "soma-1-a-5",
		titulo: "Soma de 1 a 5",
		enunciado: "Some os números de 1 a 5 num laço e imprima o total.",
		codigoInicial: `var total = 0;
// escreva o laço aqui
imprima(total);
`,
		saidaEsperada: ["15"],
	},
];
