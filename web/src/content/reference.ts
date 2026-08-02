import type { ReferenceSection } from "./types";

export const reference: ReferenceSection[] = [
	{
		id: "sintaxe",
		title: "Sintaxe básica",
		intro: "As regras de escrita que valem para todo programa em Grace.",
		items: [
			{
				id: "ponto-e-virgula",
				title: "Ponto e vírgula",
				syntax: "comando;",
				description:
					"Todo comando termina com ponto e vírgula.\n\nA única exceção é um bloco entre chaves — usado em se, enquanto, para, funcao e classe — que não leva ponto e vírgula depois do } que o fecha.",
				example: {
					id: "pv",
					title: "Ponto e vírgula",
					code: `imprima(1);`,
					expect: { kind: "output", lines: ["1"] },
				},
			},
			{
				id: "blocos",
				title: "Blocos",
				syntax: "{ comando; comando; }",
				description:
					"Um bloco é uma sequência de comandos entre chaves. É usado dentro de se, enquanto, para, funcao e classe, mas também pode aparecer sozinho.\n\nCada bloco cria um novo escopo: uma variável declarada dentro dele deixa de existir assim que o bloco termina, mesmo que exista uma variável de mesmo nome fora dele.",
				example: {
					id: "bloco",
					title: "Bloco de comandos",
					code: `{
	imprima(1);
	imprima(2);
}`,
					expect: { kind: "output", lines: ["1", "2"] },
				},
			},
			{
				id: "comentarios",
				title: "Comentários",
				syntax: "// texto até o fim da linha",
				description:
					"Tudo depois de // na mesma linha é ignorado pelo Grace.\n\nNão existe comentário de bloco (várias linhas com /* */) — cada linha precisa começar com o próprio //.",
				example: {
					id: "comentario",
					title: "Um comentário",
					code: `// isso é um comentário
imprima(1); // isso também é`,
					expect: { kind: "output", lines: ["1"] },
				},
			},
		],
	},
	{
		id: "palavras-chave",
		title: "Palavras-chave",
		intro: "As 17 palavras reservadas da linguagem — a lista é exaustiva, não existe nenhuma outra.",
		items: [
			{
				id: "var",
				title: "var",
				syntax: "var nome = valor;",
				description: "Declara uma variável nova.",
				example: {
					id: "var",
					title: "var",
					code: `var x = 1;
imprima(x);`,
					expect: { kind: "output", lines: ["1"] },
				},
			},
			{
				id: "se",
				title: "se",
				syntax: "se (condição) { ... }",
				description: "Executa um bloco só se a condição for verdadeira.",
				example: {
					id: "se",
					title: "se",
					code: `se (verdadeiro) {
	imprima("sim");
}`,
					expect: { kind: "output", lines: ["sim"] },
				},
			},
			{
				id: "senao",
				title: "senao",
				syntax: "se (condição) { ... } senao { ... }",
				description: "O caminho alternativo de um se, quando a condição é falsa.",
				example: {
					id: "senao",
					title: "senao",
					code: `se (falso) {
	imprima("sim");
} senao {
	imprima("não");
}`,
					expect: { kind: "output", lines: ["não"] },
				},
			},
			{
				id: "retorna",
				title: "retorna",
				syntax: "retorna valor;",
				description: "Devolve um valor de dentro de uma função, encerrando a chamada.",
				example: {
					id: "retorna",
					title: "retorna",
					code: `funcao cinco() {
	retorna 5;
}
imprima(cinco());`,
					expect: { kind: "output", lines: ["5"] },
				},
			},
			{
				id: "enquanto",
				title: "enquanto",
				syntax: "enquanto (condição) { ... }",
				description:
					"Repete um bloco enquanto a condição for verdadeira.\n\nA condição é testada antes de cada repetição, inclusive a primeira: se ela já começar falsa, o bloco nunca chega a rodar.",
				example: {
					id: "enquanto",
					title: "enquanto",
					code: `var i = 0;
enquanto (i < 2) {
	imprima(i);
	i = i + 1;
}`,
					expect: { kind: "output", lines: ["0", "1"] },
				},
			},
			{
				id: "para",
				title: "para",
				syntax: "para (início; condição; atualização) { ... }",
				description:
					"Repete um bloco um número contado de vezes.\n\nA variável criada na primeira parte (como var i = 0) só existe dentro do laço — ela deixa de existir assim que o para termina.",
				example: {
					id: "para",
					title: "para",
					code: `para (var i = 0; i < 2; i = i + 1) {
	imprima(i);
}`,
					expect: { kind: "output", lines: ["0", "1"] },
				},
			},
			{
				id: "imprima",
				title: "imprima",
				syntax: "imprima(valor);",
				description: "Mostra um valor na saída do programa.",
				example: {
					id: "imprima",
					title: "imprima",
					code: `imprima("oi");`,
					expect: { kind: "output", lines: ["oi"] },
				},
			},
			{
				id: "nulo",
				title: "nulo",
				syntax: "nulo",
				description: "O valor que representa \"nenhum valor\". É impresso como Nulo, com maiúscula.",
				example: {
					id: "nulo",
					title: "nulo",
					code: `imprima(nulo);`,
					expect: { kind: "output", lines: ["Nulo"] },
				},
			},
			{
				id: "classe",
				title: "classe",
				syntax: "classe Nome { ... }",
				description:
					"Declara um molde para criar objetos.\n\nUma classe também é um valor como outro qualquer: pode ser guardada numa variável, e essa variável passa a funcionar como a própria classe para criar novos objetos.",
				example: {
					id: "classe",
					title: "classe",
					code: `classe Pessoa {
	var nome;
	construtor(nome) {
		este.nome = nome;
	}
}
var p = Pessoa("Ana");
imprima(p.nome);`,
					expect: { kind: "output", lines: ["Ana"] },
				},
			},
			{
				id: "funcao",
				title: "funcao",
				syntax: "funcao nome(parâmetros) { ... }",
				description:
					"Declara uma função.\n\nUma função é um valor como outro qualquer: pode ser guardada numa variável e chamada através dela.",
				example: {
					id: "funcao",
					title: "funcao",
					code: `funcao dobro(n) {
	retorna n * 2;
}
imprima(dobro(4));`,
					expect: { kind: "output", lines: ["8"] },
				},
			},
			{
				id: "ou",
				title: "ou",
				syntax: "condição ou condição",
				description: "Operador lógico \"ou\": verdadeiro se pelo menos um dos dois lados for verdadeiro.",
				example: {
					id: "ou",
					title: "ou",
					code: `imprima(verdadeiro ou falso);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "e",
				title: "e",
				syntax: "condição e condição",
				description: "Operador lógico \"e\": verdadeiro só se os dois lados forem verdadeiros.",
				example: {
					id: "e",
					title: "e",
					code: `imprima(verdadeiro e falso);`,
					expect: { kind: "output", lines: ["Falso"] },
				},
			},
			{
				id: "super",
				title: "super",
				syntax: "super.metodo()",
				description: "Dentro de um método, chama a versão do método definida na superclasse.",
				example: {
					id: "super",
					title: "super",
					code: `classe Animal {
	falar() {
		retorna "...";
	}
}
classe Cachorro < Animal {
	falar() {
		retorna super.falar() + " au au";
	}
}
var c = Cachorro();
imprima(c.falar());`,
					expect: { kind: "output", lines: ["... au au"] },
				},
			},
			{
				id: "este",
				title: "este",
				syntax: "este.atributo",
				description: "Dentro de um método, se refere ao próprio objeto que está sendo usado.",
				example: {
					id: "este",
					title: "este",
					code: `classe Contador {
	var valor;
	construtor(valor) {
		este.valor = valor;
	}
}
var c = Contador(3);
imprima(c.valor);`,
					expect: { kind: "output", lines: ["3"] },
				},
			},
			{
				id: "verdadeiro",
				title: "verdadeiro",
				syntax: "verdadeiro",
				description: "O valor lógico verdadeiro.",
				example: {
					id: "verdadeiro",
					title: "verdadeiro",
					code: `imprima(verdadeiro);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "falso",
				title: "falso",
				syntax: "falso",
				description: "O valor lógico falso.",
				example: {
					id: "falso",
					title: "falso",
					code: `imprima(falso);`,
					expect: { kind: "output", lines: ["Falso"] },
				},
			},
			{
				id: "construtor",
				title: "construtor",
				syntax: "construtor(parâmetros) { ... }",
				description: "O método especial que roda quando um objeto novo é criado a partir de uma classe.",
				example: {
					id: "construtor",
					title: "construtor",
					code: `classe Evento {
	construtor() {
		imprima("criado");
	}
}
Evento();`,
					expect: { kind: "output", lines: ["criado"] },
				},
			},
		],
	},
	{
		id: "operadores",
		title: "Operadores",
		intro: "Só os operadores que o Grace realmente reconhece.",
		items: [
			{
				id: "soma",
				title: "+ (soma / concatenação)",
				description: "Soma dois números, ou junta dois textos. Não mistura os dois tipos.",
				example: {
					id: "soma",
					title: "+",
					code: `imprima(2 + 3);
imprima("a" + "b");`,
					expect: { kind: "output", lines: ["5", "ab"] },
				},
			},
			{
				id: "subtracao",
				title: "- (subtração)",
				description: "Subtrai o segundo número do primeiro.",
				example: {
					id: "subtracao",
					title: "-",
					code: `imprima(5 - 2);`,
					expect: { kind: "output", lines: ["3"] },
				},
			},
			{
				id: "multiplicacao",
				title: "* (multiplicação)",
				description: "Multiplica dois números.",
				example: {
					id: "multiplicacao",
					title: "*",
					code: `imprima(4 * 3);`,
					expect: { kind: "output", lines: ["12"] },
				},
			},
			{
				id: "divisao",
				title: "/ (divisão)",
				description:
					"Divide dois números. O resultado pode ter casas decimais.\n\nNão existe uma divisão inteira separada: 7 / 2 sempre dá 3.5, nunca 3.",
				example: {
					id: "divisao",
					title: "/",
					code: `imprima(7 / 2);`,
					expect: { kind: "output", lines: ["3.5"] },
				},
			},
			{
				id: "negativo",
				title: "- (negativo)",
				description: "Troca o sinal de um número, quando usado antes de um único valor.",
				example: {
					id: "negativo",
					title: "- unário",
					code: `imprima(-5);`,
					expect: { kind: "output", lines: ["-5"] },
				},
			},
			{
				id: "igual",
				title: "==",
				description: "Verdadeiro se os dois valores forem iguais.",
				example: {
					id: "igual",
					title: "==",
					code: `imprima(5 == 5);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "diferente",
				title: "!=",
				description: "Verdadeiro se os dois valores forem diferentes.",
				example: {
					id: "diferente",
					title: "!=",
					code: `imprima(1 != 2);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "maior",
				title: ">",
				description: "Verdadeiro se o primeiro número for maior que o segundo.",
				example: {
					id: "maior",
					title: ">",
					code: `imprima(5 > 3);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "maior-igual",
				title: ">=",
				description: "Verdadeiro se o primeiro número for maior ou igual ao segundo.",
				example: {
					id: "maior-igual",
					title: ">=",
					code: `imprima(5 >= 5);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "menor",
				title: "<",
				description: "Verdadeiro se o primeiro número for menor que o segundo.",
				example: {
					id: "menor",
					title: "<",
					code: `imprima(3 < 5);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "menor-igual",
				title: "<=",
				description: "Verdadeiro se o primeiro número for menor ou igual ao segundo.",
				example: {
					id: "menor-igual",
					title: "<=",
					code: `imprima(5 <= 4);`,
					expect: { kind: "output", lines: ["Falso"] },
				},
			},
			{
				id: "nao",
				title: "!",
				description: "Inverte um valor lógico.",
				example: {
					id: "nao",
					title: "!",
					code: `imprima(!verdadeiro);`,
					expect: { kind: "output", lines: ["Falso"] },
				},
			},
		],
	},
	{
		id: "tipos",
		title: "Tipos e valores",
		intro: "O Grace tem quatro tipos de valor.",
		items: [
			{
				id: "numero",
				title: "Número",
				description:
					"Existe só um tipo de número, sempre com ponto flutuante — não há um tipo separado para números inteiros.\n\nQuando o resultado é um número inteiro, o Grace imprime sem casas decimais (2, não 2.0). Quando não é, imprime as casas decimais normalmente (3.5).",
				example: {
					id: "numero",
					title: "Número",
					code: `imprima(7 / 2);`,
					expect: { kind: "output", lines: ["3.5"] },
				},
			},
			{
				id: "texto",
				title: "Texto",
				description: "Uma sequência de caracteres entre aspas.",
				example: {
					id: "texto",
					title: "Texto",
					code: `imprima("Grace");`,
					expect: { kind: "output", lines: ["Grace"] },
				},
			},
			{
				id: "logico",
				title: "Lógico",
				description: "verdadeiro ou falso. Impressos como Verdadeiro e Falso, com maiúscula.",
				example: {
					id: "logico",
					title: "Lógico",
					code: `imprima(verdadeiro);
imprima(falso);`,
					expect: { kind: "output", lines: ["Verdadeiro", "Falso"] },
				},
			},
			{
				id: "nulo-tipo",
				title: "Nulo",
				description: "Representa a ausência de valor. Impresso como Nulo, com maiúscula.",
				example: {
					id: "nulo-tipo",
					title: "Nulo",
					code: `imprima(nulo);`,
					expect: { kind: "output", lines: ["Nulo"] },
				},
			},
		],
	},
	{
		id: "controle-de-fluxo",
		title: "Controle de fluxo",
		items: [
			{
				id: "se-senao-fluxo",
				title: "se / senao",
				syntax: "se (condição) { ... } senao { ... }",
				description: "Escolhe um entre dois caminhos, dependendo de uma condição.",
				example: {
					id: "se-senao-fluxo",
					title: "se / senao",
					code: `var idade = 20;
se (idade >= 18) {
	imprima("maior");
} senao {
	imprima("menor");
}`,
					expect: { kind: "output", lines: ["maior"] },
				},
			},
			{
				id: "enquanto-fluxo",
				title: "enquanto",
				syntax: "enquanto (condição) { ... }",
				description: "Repete enquanto a condição continuar verdadeira.",
				example: {
					id: "enquanto-fluxo",
					title: "enquanto",
					code: `var i = 0;
enquanto (i < 3) {
	imprima(i);
	i = i + 1;
}`,
					expect: { kind: "output", lines: ["0", "1", "2"] },
				},
			},
			{
				id: "para-fluxo",
				title: "para",
				syntax: "para (início; condição; atualização) { ... }",
				description: "Uma forma compacta de enquanto, para quando o número de repetições é conhecido.",
				example: {
					id: "para-fluxo",
					title: "para",
					code: `para (var i = 0; i < 3; i = i + 1) {
	imprima(i);
}`,
					expect: { kind: "output", lines: ["0", "1", "2"] },
				},
			},
		],
	},
	{
		id: "funcoes",
		title: "Funções",
		items: [
			{
				id: "declaracao",
				title: "Declaração e parâmetros",
				syntax: "funcao nome(a, b) { retorna a + b; }",
				description: "Uma função tem nome, zero ou mais parâmetros, e um corpo entre chaves.",
				example: {
					id: "declaracao",
					title: "Declaração",
					code: `funcao soma(a, b) {
	retorna a + b;
}
imprima(soma(2, 3));`,
					expect: { kind: "output", lines: ["5"] },
				},
			},
			{
				id: "aninhamento",
				title: "Aninhamento",
				description: "Uma função pode ser declarada dentro de outra, e chamada normalmente de lá de dentro.",
				example: {
					id: "aninhamento",
					title: "Função dentro de função",
					code: `funcao externa() {
	funcao interna() {
		retorna 10;
	}
	retorna interna() + 5;
}
imprima(externa());`,
					expect: { kind: "output", lines: ["15"] },
				},
				warning:
					"O aninhamento não cria um fechamento (closure): a função interna não enxerga as variáveis locais da função externa, só os próprios parâmetros e variáveis. Tentar usar uma variável de fora dá o mesmo erro de \"variável não existe\" que usar uma variável nunca declarada.",
				demonstratedError: {
					id: "aninhamento-sem-closure",
					title: "A função interna não vê a variável da externa",
					code: `funcao externa() {
	var x = 10;
	funcao interna() {
		retorna x;
	}
	retorna interna();
}
imprima(externa());`,
					expect: { kind: "error" },
				},
			},
			{
				id: "recursao-funcoes",
				title: "Recursão",
				description: "Uma função pode chamar a si mesma.",
				example: {
					id: "recursao-funcoes",
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
			},
			{
				id: "retorno-implicito",
				title: "Retorno implícito",
				description: "Uma função que não usa retorna devolve Nulo automaticamente.",
				example: {
					id: "retorno-implicito",
					title: "Sem retorna",
					code: `funcao vazia() {}
imprima(vazia());`,
					expect: { kind: "output", lines: ["Nulo"] },
				},
			},
		],
	},
	{
		id: "classes",
		title: "Classes",
		items: [
			{
				id: "declaracao-classe",
				title: "classe, var e construtor",
				syntax: "classe Nome { var atributo; construtor(...) { ... } }",
				description:
					"Toda classe que vai guardar dados precisa declarar cada atributo com var antes de poder usá-lo com este.",
				example: {
					id: "declaracao-classe",
					title: "Uma classe simples",
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
			},
			{
				id: "heranca-classe",
				title: "Herança com <",
				syntax: "classe B < A { ... }",
				description:
					"Uma classe herda atributos e métodos de outra com <. A subclasse precisa declarar o próprio construtor — mesmo que só repasse os valores com super.construtor(...).",
				example: {
					id: "heranca-classe",
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
			},
		],
	},
	{
		id: "limitacoes",
		title: "Limitações conhecidas",
		intro: "O que o Grace ainda não tem — melhor saber de antemão do que descobrir no meio de um programa.",
		items: [
			{
				id: "sem-atribuicao-composta",
				title: "+= -= *= /= não existem",
				description:
					"O scanner reconhece esses símbolos, mas o parser não os aceita em nenhum comando. Escreva x = x + 1; por extenso.",
				example: {
					id: "sem-atribuicao-composta",
					title: "+= não é aceito",
					code: `var x = 1;
x += 5;`,
					expect: { kind: "error" },
				},
			},
			{
				id: "sem-escolha-caso",
				title: "escolha / caso não existem",
				description: "Não há um comando de múltipla escolha. Use se / senao encadeados.",
				example: {
					id: "sem-escolha-caso",
					title: "escolha não é reconhecido",
					code: `escolha (1) {
	caso 1: imprima("um");
}`,
					expect: { kind: "error" },
				},
			},
			{
				id: "sem-conversao-texto",
				title: '"texto" + número não funciona',
				description:
					"O + só soma dois números ou junta dois textos — nunca mistura os dois, e o Grace não converte um número em texto automaticamente. Imprima os dois valores separadamente.",
				example: {
					id: "sem-conversao-texto",
					title: "Misturando tipos",
					code: `imprima("nota: " + 10);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "sem-escapes",
				title: "Escapes como \\n não são interpretados",
				description: 'O texto entre aspas é copiado ao pé da letra. "linha1\\nlinha2" imprime o \\n literal, não quebra linha.',
				example: {
					id: "sem-escapes",
					title: "\\n literal",
					code: `imprima("linha1\\nlinha2");`,
					expect: { kind: "output", lines: ["linha1\\nlinha2"] },
				},
			},
		],
	},
	{
		id: "erros",
		title: "Catálogo de erros",
		intro:
			"A maioria dos erros de sintaxe segue o padrão \"Esperava X, mas encontrei Y\" — o texto já diz o que falta. Esta lista cobre os erros mais específicos, os que valem uma explicação à parte.",
		items: [
			{
				id: "texto-nao-fechado",
				title: "Texto não fechado",
				description:
					'Mensagem: "O texto iniciado com \'"\' nunca foi fechado." Significa que uma aspa de abertura não tem par. Feche o texto com outra aspa.',
				example: {
					id: "texto-nao-fechado",
					title: "Aspa sem fechar",
					code: `imprima("abc);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "caractere-nao-reconhecido",
				title: "Caractere não reconhecido",
				description:
					'Mensagem: "O caractere \'X\' não é reconhecido pela linguagem Grace." Algum símbolo digitado (como @ ou #) não existe na linguagem.',
				example: {
					id: "caractere-nao-reconhecido",
					title: "Símbolo inválido",
					code: `imprima(1 @ 2);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "numero-seguido-de-letra",
				title: "Número seguido de letra",
				description:
					'Mensagem: "O número \'X\' não pode ser seguido de letras." Nomes de variáveis não podem começar com um número.',
				example: {
					id: "numero-seguido-de-letra",
					title: "Nome inválido",
					code: `var 5x = 1;`,
					expect: { kind: "error" },
				},
			},
			{
				id: "variavel-nao-existe",
				title: "Variável não existe",
				description:
					'Mensagem: "A variável \'X\' não existe." Você tentou ler uma variável que nunca foi declarada com var.',
				example: {
					id: "variavel-nao-existe",
					title: "Ler sem declarar",
					code: `imprima(naoexiste);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "variavel-ja-declarada",
				title: "Variável já declarada neste escopo",
				description:
					'Mensagem: "Variável \'X\' já foi declarada neste escopo." Dentro de um mesmo bloco ou função, dois var com o mesmo nome colidem. Esse erro só existe dentro de blocos/funções — no nível mais externo do programa, redeclarar uma variável apenas a substitui, sem erro.',
				example: {
					id: "variavel-ja-declarada",
					title: "Duas var x no mesmo bloco",
					code: `funcao f() {
	var x = 1;
	var x = 2;
	retorna x;
}
imprima(f());`,
					expect: { kind: "error" },
				},
			},
			{
				id: "variavel-usada-antes-de-inicializada",
				title: "Variável usada antes de ser inicializada",
				description:
					'Mensagem: "Variável \'X\' usada antes de ser inicializada." Dentro de um bloco ou função, o próprio valor inicial de uma var não pode se referir a ela mesma (a variável ainda não existe nesse instante). Assim como o erro acima, essa checagem só vale dentro de blocos/funções.',
				example: {
					id: "variavel-usada-antes-de-inicializada",
					title: "var x = x dentro de um bloco",
					code: `se (verdadeiro) {
	var x = x;
	imprima(x);
}`,
					expect: { kind: "error" },
				},
			},
			{
				id: "divisao-por-zero-erro",
				title: "Divisão por zero",
				description: 'Mensagem: "Não é possível dividir por zero." O denominador de uma divisão era zero.',
				example: {
					id: "divisao-por-zero-erro",
					title: "Dividir por zero",
					code: `imprima(10 / 0);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "operador-mais-incompativel",
				title: "Operador + com tipos incompatíveis",
				description:
					'Mensagem: "O operador \'+\' funciona com dois números... ou duas strings..." Você tentou somar um texto com um número.',
				example: {
					id: "operador-mais-incompativel",
					title: "Texto + número",
					code: `imprima("a" + 1);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "atributo-nao-declarado-erro",
				title: "Atributo não declarado",
				description:
					'Mensagem: "O atributo \'X\' não foi declarado na classe \'Y\'." Você usou este.algo sem antes declarar var algo; na classe.',
				example: {
					id: "atributo-nao-declarado-erro",
					title: "Atributo sem var",
					code: `classe C {
	construtor() {
		este.x = 1;
	}
}
C();`,
					expect: { kind: "error" },
				},
			},
			{
				id: "classe-sem-construtor",
				title: "Classe sem construtor não aceita argumentos",
				description:
					'Mensagem: "A classe \'X\' não tem construtor, então \'X()\' não aceita argumentos." Você passou valores para uma classe que não declarou construtor(...).',
				example: {
					id: "classe-sem-construtor",
					title: "Argumentos sem construtor",
					code: `classe C {}
C(1, 2);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "numero-de-argumentos",
				title: "Número errado de argumentos",
				description:
					'Mensagem: "A função/O método/O construtor da classe \'X\' espera N argumento(s), mas recebeu M." A chamada não bate com os parâmetros declarados.',
				example: {
					id: "numero-de-argumentos",
					title: "Argumentos a menos",
					code: `funcao f(a, b) {
	retorna a + b;
}
imprima(f(1));`,
					expect: { kind: "error" },
				},
			},
			{
				id: "superclasse-nao-declarada",
				title: "Superclasse não declarada",
				description:
					'Mensagem: "A superclasse \'X\' não foi declarada." A classe usada depois do < em classe B < A ainda não existe.',
				example: {
					id: "superclasse-nao-declarada",
					title: "Herdar de classe inexistente",
					code: `classe B < A {}`,
					expect: { kind: "error" },
				},
			},
			{
				id: "atributo-duplicado-superclasse",
				title: "Atributo já declarado na superclasse",
				description:
					'Mensagem: "O atributo \'X\' já foi declarado na superclasse \'Y\'." A subclasse repetiu var de um atributo que já vem por herança.',
				example: {
					id: "atributo-duplicado-superclasse",
					title: "Atributo repetido",
					code: `classe A {
	var x;
	construtor(x) {
		este.x = x;
	}
}
classe B < A {
	var x;
	construtor(x) {
		super.construtor(x);
	}
}`,
					expect: { kind: "error" },
				},
			},
			{
				id: "super-fora-de-metodo",
				title: "'super' fora de um método",
				description:
					'Mensagem: "\'super\' só pode ser usado dentro de um método de uma classe." super só existe dentro do corpo de um método.',
				example: {
					id: "super-fora-de-metodo",
					title: "super no topo do programa",
					code: `imprima(super.foo);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "classe-sem-superclasse",
				title: "Classe não herda de ninguém",
				description:
					'Mensagem: "A classe \'X\' não herda de ninguém, então não é possível usar \'super\' aqui." super foi usado numa classe que não tem <.',
				example: {
					id: "classe-sem-superclasse",
					title: "super sem herança",
					code: `classe A {
	metodo() {
		retorna super.foo();
	}
}
var a = A();
a.metodo();`,
					expect: { kind: "error" },
				},
			},
			{
				id: "metodo-nao-existe-superclasse",
				title: "Método não existe na superclasse",
				description:
					'Mensagem: "O método \'X\' não existe na superclasse \'Y\'." O nome depois de super. não é um método da classe de cima.',
				example: {
					id: "metodo-nao-existe-superclasse",
					title: "Método inexistente",
					code: `classe A {}
classe B < A {
	metodo() {
		retorna super.inexistente();
	}
}
var b = B();
b.metodo();`,
					expect: { kind: "error" },
				},
			},
			{
				id: "limite-de-passos",
				title: "Limite de passos (laço infinito)",
				description:
					'Mensagem: "O programa passou de 1.000.000 de passos e foi interrompido." Normalmente significa que a condição de um enquanto nunca fica falsa.',
				example: {
					id: "limite-de-passos",
					title: "Laço sem fim",
					code: `enquanto (verdadeiro) {}`,
					expect: { kind: "error" },
				},
			},
		],
	},
];
