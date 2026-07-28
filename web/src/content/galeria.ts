import type { Topic } from "./types";

export const galeria: Topic[] = [
	{
		id: "variaveis",
		title: "Variáveis",
		description: "Guardar e combinar valores com var.",
		examples: [
			{
				id: "guardar-valor",
				title: "Guardar um valor",
				code: `var nome = "Grace";
imprima(nome);`,
				expect: { kind: "output", lines: ["Grace"] },
			},
			{
				id: "fazer-conta",
				title: "Fazer uma conta",
				code: `var a = 10;
var b = 5;
imprima(a + b);`,
				expect: { kind: "output", lines: ["15"] },
			},
		],
	},
	{
		id: "condicionais",
		title: "Condicionais",
		description: "Tomar decisões com se / senao.",
		examples: [
			{
				id: "maior-de-idade",
				title: "Maior de idade",
				code: `var idade = 20;
se (idade >= 18) {
	imprima("maior de idade");
} senao {
	imprima("menor de idade");
}`,
				expect: { kind: "output", lines: ["maior de idade"] },
			},
			{
				id: "comparar-numeros",
				title: "Comparar dois números",
				code: `var a = 7;
var b = 3;
se (a > b) {
	imprima("a é maior");
} senao {
	imprima("b é maior ou igual");
}`,
				expect: { kind: "output", lines: ["a é maior"] },
			},
		],
	},
	{
		id: "lacos",
		title: "Laços",
		description: "Repetir com enquanto e para.",
		examples: [
			{
				id: "contar-ate-3",
				title: "Contar até 3",
				code: `var contador = 0;
enquanto (contador < 3) {
	imprima(contador);
	contador = contador + 1;
}`,
				expect: { kind: "output", lines: ["0", "1", "2"] },
			},
			{
				id: "somar-1-a-5",
				title: "Somar de 1 a 5",
				code: `var soma = 0;
para (var i = 1; i <= 5; i = i + 1) {
	soma = soma + i;
}
imprima(soma);`,
				expect: { kind: "output", lines: ["15"] },
			},
		],
	},
	{
		id: "funcoes",
		title: "Funções",
		description: "Empacotar código com funcao e retorna.",
		examples: [
			{
				id: "dobrar",
				title: "Dobrar um número",
				code: `funcao dobro(n) {
	retorna n * 2;
}
imprima(dobro(21));`,
				expect: { kind: "output", lines: ["42"] },
			},
			{
				id: "somar-dois",
				title: "Somar dois números",
				code: `funcao soma(a, b) {
	retorna a + b;
}
imprima(soma(3, 4));`,
				expect: { kind: "output", lines: ["7"] },
			},
		],
	},
	{
		id: "recursao",
		title: "Recursão",
		description: "Uma função que chama a si mesma.",
		examples: [
			{
				id: "fatorial",
				title: "Fatorial",
				code: `funcao fatorial(n) {
	se (n <= 1) {
		retorna 1;
	}
	retorna n * fatorial(n - 1);
}
imprima(fatorial(5));`,
				expect: { kind: "output", lines: ["120"] },
			},
			{
				id: "contagem-regressiva",
				title: "Contagem regressiva",
				code: `funcao contar(n) {
	se (n <= 0) {
		imprima("fim");
		retorna nulo;
	}
	imprima(n);
	contar(n - 1);
}
contar(3);`,
				expect: { kind: "output", lines: ["3", "2", "1", "fim"] },
			},
		],
	},
	{
		id: "classes",
		title: "Classes",
		description: "Agrupar dados e comportamento com classe.",
		examples: [
			{
				id: "cachorro-late",
				title: "Um cachorro que late",
				code: `classe Cachorro {
	var nome;
	construtor(nome) {
		este.nome = nome;
	}
	latir() {
		imprima(este.nome + " late");
	}
}
var rex = Cachorro("Rex");
rex.latir();`,
				expect: { kind: "output", lines: ["Rex late"] },
			},
			{
				id: "dois-cachorros",
				title: "Dois cachorros diferentes",
				code: `classe Cachorro {
	var nome;
	construtor(nome) {
		este.nome = nome;
	}
	latir() {
		imprima(este.nome + " late");
	}
}
var rex = Cachorro("Rex");
var bidu = Cachorro("Bidu");
rex.latir();
bidu.latir();`,
				expect: { kind: "output", lines: ["Rex late", "Bidu late"] },
			},
		],
	},
];
