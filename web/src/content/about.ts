export interface AboutSection {
	id: string;
	title: string;
	paragraphs: string[];
}

export const ABOUT_LEAD =
	"GHopper é uma linguagem de programação didática e um visualizador do próprio compilador e da própria máquina virtual: o mesmo código que interpreta um programa GHopper serve, passo a passo, para mostrar como ele foi interpretado.";

export const ABOUT_SECTIONS: AboutSection[] = [
	{
		id: "o-que-e",
		title: "O que é",
		paragraphs: [
			"GHopper, a linguagem, tem um scanner, um parser, um resolver de escopos, um compilador de bytecode e uma VM de pilha, todos escritos em Rust e compilados para WebAssembly. Cada uma dessas cinco fases emite eventos tipados enquanto trabalha — não um log de texto, mas uma estrutura de dados fiel ao que o compilador e a VM de fato fizeram — e esta plataforma web consome esses eventos para reconstruir tokens, árvore sintática, bytecode e execução, um passo de cada vez.",
		],
	},
	{
		id: "para-quem",
		title: "Para quem",
		paragraphs: [
			"Para quem já programa e está cursando Compiladores ou Construção de Linguagens — ou estudando o assunto por conta própria. O objeto de ensino é a implementação de uma linguagem: como um texto vira tokens, como tokens viram uma árvore, como uma árvore vira bytecode, e como uma pilha executa esse bytecode.",
			"Não é uma ferramenta para aprender o que é uma variável, um laço ou uma função — isso já é pressuposto.",
		],
	},
	{
		id: "por-que-em-portugues",
		title: "Por que em português",
		paragraphs: [
			"A sintaxe da linguagem e toda a interface são em português para tirar do caminho uma barreira que não deveria estar ali: aprender a implementação de um compilador já é difícil o bastante sem que o idioma da própria ferramenta seja mais um obstáculo. A literatura de compiladores continua majoritariamente em inglês — nada aqui substitui isso, só remove uma camada de tradução no meio do aprendizado.",
		],
	},
	{
		id: "como-funciona-por-dentro",
		title: "Como funciona por dentro",
		paragraphs: [
			"O pipeline é sempre o mesmo, em cinco fases: o scanner separa o texto-fonte em tokens; o parser organiza os tokens em uma árvore sintática (AST); o resolver decide, antes de qualquer bytecode existir, se cada uso de variável é válido; o compilador percorre a árvore e emite bytecode; a VM executa esse bytecode sobre uma pilha de valores.",
			"Cada fase implementa o mesmo trait — EventSink — e emite eventos tipados conforme trabalha, em vez de produzir uma narração escrita à parte. O visualizador não simula nada: ele reproduz esses eventos.",
		],
	},
];

export const ABOUT_TCC = {
	title: "Que é um TCC",
	paragraphs: [
		"Este site é o artefato de um Trabalho de Conclusão de Curso em [curso], [instituição], [ano]. Orientação: [orientador(a)].",
	],
	repoUrl: "https://github.com/rayxves/GHopper",
	repoLabel: "Repositório no GitHub",
};

export const ABOUT_HOMAGE = {
	title: "A homenagem",
	paragraphs: [
		"Grace Hopper cortava pedaços de fio de cerca de 30 centímetros para mostrar a estudantes a distância que a eletricidade percorre em um nanossegundo — tornar tangível algo que só é invisível por ser rápido demais.",
		"É, numa escala bem menor, o que esta ferramenta tenta fazer com a execução de um programa: parar cada passo que a VM daria em microssegundos e deixar ver o que aconteceu. O nome é uma referência a ela.",
	],
};
