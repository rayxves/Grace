import type { Licao } from "./types";

export const licoes: Licao[] = [
	{
		id: "programa",
		numero: 1,
		titulo: "O que é um programa",
		sintaxe: "imprima",
		conceito: [
			"Um programa é uma lista de instruções que o computador segue, uma de cada vez, de cima para baixo.",
			"A primeira instrução que você vai aprender é imprima, que mostra um valor na tela.",
		],
		exemplo: {
			id: "ola-mundo",
			title: "Olá, mundo!",
			code: `imprima("Olá, mundo!");`,
			expect: { kind: "output", lines: ["Olá, mundo!"] },
		},
		desafio: "Escreva um programa que imprima o seu nome.",
	},
	{
		id: "variaveis",
		numero: 2,
		titulo: "Variáveis",
		sintaxe: "var",
		conceito: [
			"Uma variável é como uma caixa com um nome, onde você guarda um valor para usar depois.",
			"Você cria uma variável com var, escolhe um nome para ela e dá um valor inicial.",
		],
		exemplo: {
			id: "nome",
			title: "Guardando um nome",
			code: `var nome = "Ana";
imprima(nome);`,
			expect: { kind: "output", lines: ["Ana"] },
		},
		desafio: "Crie uma variável com a sua idade e imprima ela.",
	},
	{
		id: "numeros",
		numero: 3,
		titulo: "Números e contas",
		sintaxe: "+  -  *  /",
		conceito: [
			"Você pode fazer contas com números usando + (soma), - (subtração), * (multiplicação) e / (divisão).",
			"A divisão sempre pode dar um resultado com casas decimais, mesmo quando os números de entrada são inteiros.",
		],
		exemplo: {
			id: "quatro-operacoes",
			title: "As quatro operações",
			code: `imprima(10 + 5);
imprima(10 - 5);
imprima(10 * 5);
imprima(10 / 5);`,
			expect: { kind: "output", lines: ["15", "5", "50", "2"] },
		},
		desafio: "Imprima o resultado de 7 dividido por 2. Repare que o resultado não é um número inteiro.",
	},
	{
		id: "texto",
		numero: 4,
		titulo: "Texto (strings)",
		sintaxe: '"..."  +',
		conceito: [
			"Texto — uma palavra, uma frase, um nome — fica sempre entre aspas. Isso se chama string.",
			"Para juntar dois textos, use o mesmo + que você já usou com números.",
		],
		exemplo: {
			id: "juntar-texto",
			title: "Juntando dois textos",
			code: `var saudacao = "Olá, " + "mundo!";
imprima(saudacao);`,
			expect: { kind: "output", lines: ["Olá, mundo!"] },
		},
		aviso:
			"O + só funciona entre dois números ou entre dois textos — nunca misturando os dois. O Grace não converte um número em texto automaticamente.",
		erroDemonstrado: {
			id: "texto-mais-numero",
			title: "Misturando texto com número",
			code: `"nota: " + 10;`,
			expect: { kind: "error" },
		},
		desafio: 'Crie duas variáveis de texto, uma com "bom" e outra com " dia", e imprima elas juntas.',
	},
	{
		id: "comparacoes",
		numero: 5,
		titulo: "Verdadeiro e falso",
		sintaxe: "==  !=  >  >=  <  <=",
		conceito: [
			"Além de números e texto, existe um tipo de valor que só pode ser verdadeiro ou falso.",
			"Comparações como == (igual), != (diferente), > (maior) e < (menor) produzem esse tipo de valor.",
		],
		exemplo: {
			id: "comparando",
			title: "Comparando números",
			code: `imprima(5 > 3);
imprima(5 == 3);`,
			expect: { kind: "output", lines: ["Verdadeiro", "Falso"] },
		},
		desafio: "Compare a sua idade com o número 18 usando >= e imprima o resultado.",
	},
	{
		id: "condicoes",
		numero: 6,
		titulo: "Condições",
		sintaxe: "se / senao",
		conceito: [
			"Com se, o programa escolhe um caminho diferente dependendo de uma condição ser verdadeira ou falsa.",
			"O senao é opcional: é o caminho que o programa segue quando a condição do se é falsa.",
		],
		exemplo: {
			id: "maior-de-idade",
			title: "Pode dirigir?",
			code: `var idade = 20;
se (idade >= 18) {
	imprima("pode dirigir");
} senao {
	imprima("não pode dirigir");
}`,
			expect: { kind: "output", lines: ["pode dirigir"] },
		},
		desafio: "Escreva um se/senao que imprima \"par\" ou \"ímpar\" — pense em como comparar com zero pode ajudar aqui.",
	},
	{
		id: "enquanto",
		numero: 7,
		titulo: "Repetição",
		sintaxe: "enquanto",
		conceito: [
			"enquanto repete um bloco de código sem parar, contanto que uma condição continue verdadeira.",
			"É comum ter uma variável que muda a cada volta, até que a condição fique falsa e o laço pare.",
		],
		exemplo: {
			id: "contar-ate-3",
			title: "Contando até 3",
			code: `var i = 0;
enquanto (i < 3) {
	imprima(i);
	i = i + 1;
}`,
			expect: { kind: "output", lines: ["0", "1", "2"] },
		},
		aviso:
			"Se você esquecer de atualizar a variável da condição, o laço nunca termina. O Grace interrompe automaticamente um programa depois de 1.000.000 de passos, mas o ideal é sempre garantir que a condição fique falsa em algum momento.",
		desafio: "Escreva um enquanto que imprima os números de 5 até 1, contando para trás.",
	},
	{
		id: "para",
		numero: 8,
		titulo: "Repetição contada",
		sintaxe: "para",
		conceito: [
			"para é uma forma compacta de repetir um número certo de vezes: você escreve o início, a condição e a atualização numa linha só.",
			"É a mesma ideia do enquanto, só que mais organizada quando você já sabe quantas vezes quer repetir.",
		],
		exemplo: {
			id: "contar-com-para",
			title: "Contando com para",
			code: `para (var i = 0; i < 3; i = i + 1) {
	imprima(i);
}`,
			expect: { kind: "output", lines: ["0", "1", "2"] },
		},
		desafio: "Use um para para imprimir os números de 1 a 10.",
	},
	{
		id: "funcoes",
		numero: 9,
		titulo: "Funções",
		sintaxe: "funcao / retorna",
		conceito: [
			"Uma função é um pedaço de código com nome, que você pode chamar de vários lugares do programa sem reescrever tudo de novo.",
			"retorna devolve um valor de dentro da função para quem a chamou.",
		],
		exemplo: {
			id: "dobro",
			title: "Dobrando um número",
			code: `funcao dobro(n) {
	retorna n * 2;
}
imprima(dobro(21));`,
			expect: { kind: "output", lines: ["42"] },
		},
		desafio: "Escreva uma função que recebe um número e devolve o triplo dele.",
	},
	{
		id: "recursao",
		numero: 10,
		titulo: "Recursão",
		sintaxe: "funcao chamando a si mesma",
		conceito: [
			"Uma função pode chamar a si mesma — isso se chama recursão.",
			"É útil para problemas que se repetem em versões cada vez menores de si mesmos, até chegar num caso simples que já sabe responder direto.",
		],
		exemplo: {
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
		desafio: "Escreva uma função recursiva que soma os números de 1 até n.",
	},
	{
		id: "objetos",
		numero: 11,
		titulo: "Objetos",
		sintaxe: "classe / construtor / este",
		conceito: [
			"Uma classe é um molde para criar objetos, que guardam dados (atributos) e têm comportamento (métodos).",
			"O construtor é o método especial que roda quando um objeto novo é criado. este se refere ao próprio objeto sendo criado ou usado.",
			"Todo atributo que uma classe vai usar precisa ser declarado com var dentro dela, antes de poder ser lido ou escrito com este.",
		],
		exemplo: {
			id: "cachorro",
			title: "Um cachorro que late",
			code: `classe Cachorro {
	var nome;
	construtor(nome) {
		este.nome = nome;
	}
	latir() {
		imprima(este.nome + " diz au au");
	}
}
var rex = Cachorro("Rex");
rex.latir();`,
			expect: { kind: "output", lines: ["Rex diz au au"] },
		},
		aviso:
			"Esquecer de declarar um atributo com var é um erro comum. O Grace avisa exatamente qual atributo falta e como corrigir.",
		erroDemonstrado: {
			id: "atributo-nao-declarado",
			title: "Atributo sem declarar",
			code: `classe Cachorro {
	construtor(nome) {
		este.nome = nome;
	}
}
var rex = Cachorro("Rex");`,
			expect: { kind: "error" },
		},
		desafio: "Crie uma classe Pessoa com um atributo nome e um método que imprime uma saudação com esse nome.",
	},
	{
		id: "heranca",
		numero: 12,
		titulo: "Herança",
		sintaxe: "classe B < A / super",
		conceito: [
			"Uma classe pode herdar de outra usando <, reaproveitando os atributos e métodos da classe de cima.",
			"Mas atenção: a subclasse precisa do próprio construtor. Dentro dele, super.construtor(...) chama o construtor da classe de cima.",
		],
		exemplo: {
			id: "animal-cachorro",
			title: "Cachorro herda de Animal",
			code: `classe Animal {
	var nome;
	construtor(nome) {
		este.nome = nome;
	}
}
classe Cachorro < Animal {
	construtor(nome) {
		super.construtor(nome);
	}
	latir() {
		imprima(este.nome + " au au");
	}
}
var rex = Cachorro("Rex");
rex.latir();`,
			expect: { kind: "output", lines: ["Rex au au"] },
		},
		aviso:
			"Se a subclasse não declarar o próprio construtor, ela não aceita argumentos — mesmo que a superclasse tenha um. O Grace explica isso na mensagem de erro.",
		erroDemonstrado: {
			id: "subclasse-sem-construtor",
			title: "Subclasse sem construtor próprio",
			code: `classe Animal {
	var nome;
	construtor(nome) {
		este.nome = nome;
	}
}
classe Cachorro < Animal {
}
var rex = Cachorro("Rex");`,
			expect: { kind: "error" },
		},
		desafio: "Crie uma classe Gato que herda de Animal e adiciona um método miar().",
	},
];
