import type { ReferenciaSecao } from "./types";

export const referencia: ReferenciaSecao[] = [
	{
		id: "sintaxe",
		titulo: "Sintaxe básica",
		intro: "As regras de escrita que valem para todo programa em Grace.",
		itens: [
			{
				id: "ponto-e-virgula",
				titulo: "Ponto e vírgula",
				sintaxe: "comando;",
				descricao:
					"Todo comando termina com ponto e vírgula.\n\nA única exceção é um bloco entre chaves — usado em se, enquanto, para, funcao e classe — que não leva ponto e vírgula depois do } que o fecha.",
				exemplo: {
					id: "pv",
					title: "Ponto e vírgula",
					code: `imprima(1);`,
					expect: { kind: "output", lines: ["1"] },
				},
			},
			{
				id: "blocos",
				titulo: "Blocos",
				sintaxe: "{ comando; comando; }",
				descricao:
					"Um bloco é uma sequência de comandos entre chaves. É usado dentro de se, enquanto, para, funcao e classe, mas também pode aparecer sozinho.\n\nCada bloco cria um novo escopo: uma variável declarada dentro dele deixa de existir assim que o bloco termina, mesmo que exista uma variável de mesmo nome fora dele.",
				exemplo: {
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
				titulo: "Comentários",
				sintaxe: "// texto até o fim da linha",
				descricao:
					"Tudo depois de // na mesma linha é ignorado pelo Grace.\n\nNão existe comentário de bloco (várias linhas com /* */) — cada linha precisa começar com o próprio //.",
				exemplo: {
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
		titulo: "Palavras-chave",
		intro: "As 17 palavras reservadas da linguagem — a lista é exaustiva, não existe nenhuma outra.",
		itens: [
			{
				id: "var",
				titulo: "var",
				sintaxe: "var nome = valor;",
				descricao: "Declara uma variável nova.",
				exemplo: {
					id: "var",
					title: "var",
					code: `var x = 1;
imprima(x);`,
					expect: { kind: "output", lines: ["1"] },
				},
			},
			{
				id: "se",
				titulo: "se",
				sintaxe: "se (condição) { ... }",
				descricao: "Executa um bloco só se a condição for verdadeira.",
				exemplo: {
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
				titulo: "senao",
				sintaxe: "se (condição) { ... } senao { ... }",
				descricao: "O caminho alternativo de um se, quando a condição é falsa.",
				exemplo: {
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
				titulo: "retorna",
				sintaxe: "retorna valor;",
				descricao: "Devolve um valor de dentro de uma função, encerrando a chamada.",
				exemplo: {
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
				titulo: "enquanto",
				sintaxe: "enquanto (condição) { ... }",
				descricao:
					"Repete um bloco enquanto a condição for verdadeira.\n\nA condição é testada antes de cada repetição, inclusive a primeira: se ela já começar falsa, o bloco nunca chega a rodar.",
				exemplo: {
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
				titulo: "para",
				sintaxe: "para (início; condição; atualização) { ... }",
				descricao:
					"Repete um bloco um número contado de vezes.\n\nA variável criada na primeira parte (como var i = 0) só existe dentro do laço — ela deixa de existir assim que o para termina.",
				exemplo: {
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
				titulo: "imprima",
				sintaxe: "imprima(valor);",
				descricao: "Mostra um valor na saída do programa.",
				exemplo: {
					id: "imprima",
					title: "imprima",
					code: `imprima("oi");`,
					expect: { kind: "output", lines: ["oi"] },
				},
			},
			{
				id: "nulo",
				titulo: "nulo",
				sintaxe: "nulo",
				descricao: "O valor que representa \"nenhum valor\". É impresso como Nulo, com maiúscula.",
				exemplo: {
					id: "nulo",
					title: "nulo",
					code: `imprima(nulo);`,
					expect: { kind: "output", lines: ["Nulo"] },
				},
			},
			{
				id: "classe",
				titulo: "classe",
				sintaxe: "classe Nome { ... }",
				descricao:
					"Declara um molde para criar objetos.\n\nUma classe também é um valor como outro qualquer: pode ser guardada numa variável, e essa variável passa a funcionar como a própria classe para criar novos objetos.",
				exemplo: {
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
				titulo: "funcao",
				sintaxe: "funcao nome(parâmetros) { ... }",
				descricao:
					"Declara uma função.\n\nUma função é um valor como outro qualquer: pode ser guardada numa variável e chamada através dela.",
				exemplo: {
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
				titulo: "ou",
				sintaxe: "condição ou condição",
				descricao: "Operador lógico \"ou\": verdadeiro se pelo menos um dos dois lados for verdadeiro.",
				exemplo: {
					id: "ou",
					title: "ou",
					code: `imprima(verdadeiro ou falso);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "e",
				titulo: "e",
				sintaxe: "condição e condição",
				descricao: "Operador lógico \"e\": verdadeiro só se os dois lados forem verdadeiros.",
				exemplo: {
					id: "e",
					title: "e",
					code: `imprima(verdadeiro e falso);`,
					expect: { kind: "output", lines: ["Falso"] },
				},
			},
			{
				id: "super",
				titulo: "super",
				sintaxe: "super.metodo()",
				descricao: "Dentro de um método, chama a versão do método definida na superclasse.",
				exemplo: {
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
				titulo: "este",
				sintaxe: "este.atributo",
				descricao: "Dentro de um método, se refere ao próprio objeto que está sendo usado.",
				exemplo: {
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
				titulo: "verdadeiro",
				sintaxe: "verdadeiro",
				descricao: "O valor lógico verdadeiro.",
				exemplo: {
					id: "verdadeiro",
					title: "verdadeiro",
					code: `imprima(verdadeiro);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "falso",
				titulo: "falso",
				sintaxe: "falso",
				descricao: "O valor lógico falso.",
				exemplo: {
					id: "falso",
					title: "falso",
					code: `imprima(falso);`,
					expect: { kind: "output", lines: ["Falso"] },
				},
			},
			{
				id: "construtor",
				titulo: "construtor",
				sintaxe: "construtor(parâmetros) { ... }",
				descricao: "O método especial que roda quando um objeto novo é criado a partir de uma classe.",
				exemplo: {
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
		titulo: "Operadores",
		intro: "Só os operadores que o Grace realmente reconhece.",
		itens: [
			{
				id: "soma",
				titulo: "+ (soma / concatenação)",
				descricao: "Soma dois números, ou junta dois textos. Não mistura os dois tipos.",
				exemplo: {
					id: "soma",
					title: "+",
					code: `imprima(2 + 3);
imprima("a" + "b");`,
					expect: { kind: "output", lines: ["5", "ab"] },
				},
			},
			{
				id: "subtracao",
				titulo: "- (subtração)",
				descricao: "Subtrai o segundo número do primeiro.",
				exemplo: {
					id: "subtracao",
					title: "-",
					code: `imprima(5 - 2);`,
					expect: { kind: "output", lines: ["3"] },
				},
			},
			{
				id: "multiplicacao",
				titulo: "* (multiplicação)",
				descricao: "Multiplica dois números.",
				exemplo: {
					id: "multiplicacao",
					title: "*",
					code: `imprima(4 * 3);`,
					expect: { kind: "output", lines: ["12"] },
				},
			},
			{
				id: "divisao",
				titulo: "/ (divisão)",
				descricao:
					"Divide dois números. O resultado pode ter casas decimais.\n\nNão existe uma divisão inteira separada: 7 / 2 sempre dá 3.5, nunca 3.",
				exemplo: {
					id: "divisao",
					title: "/",
					code: `imprima(7 / 2);`,
					expect: { kind: "output", lines: ["3.5"] },
				},
			},
			{
				id: "negativo",
				titulo: "- (negativo)",
				descricao: "Troca o sinal de um número, quando usado antes de um único valor.",
				exemplo: {
					id: "negativo",
					title: "- unário",
					code: `imprima(-5);`,
					expect: { kind: "output", lines: ["-5"] },
				},
			},
			{
				id: "igual",
				titulo: "==",
				descricao: "Verdadeiro se os dois valores forem iguais.",
				exemplo: {
					id: "igual",
					title: "==",
					code: `imprima(5 == 5);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "diferente",
				titulo: "!=",
				descricao: "Verdadeiro se os dois valores forem diferentes.",
				exemplo: {
					id: "diferente",
					title: "!=",
					code: `imprima(1 != 2);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "maior",
				titulo: ">",
				descricao: "Verdadeiro se o primeiro número for maior que o segundo.",
				exemplo: {
					id: "maior",
					title: ">",
					code: `imprima(5 > 3);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "maior-igual",
				titulo: ">=",
				descricao: "Verdadeiro se o primeiro número for maior ou igual ao segundo.",
				exemplo: {
					id: "maior-igual",
					title: ">=",
					code: `imprima(5 >= 5);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "menor",
				titulo: "<",
				descricao: "Verdadeiro se o primeiro número for menor que o segundo.",
				exemplo: {
					id: "menor",
					title: "<",
					code: `imprima(3 < 5);`,
					expect: { kind: "output", lines: ["Verdadeiro"] },
				},
			},
			{
				id: "menor-igual",
				titulo: "<=",
				descricao: "Verdadeiro se o primeiro número for menor ou igual ao segundo.",
				exemplo: {
					id: "menor-igual",
					title: "<=",
					code: `imprima(5 <= 4);`,
					expect: { kind: "output", lines: ["Falso"] },
				},
			},
			{
				id: "nao",
				titulo: "!",
				descricao: "Inverte um valor lógico.",
				exemplo: {
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
		titulo: "Tipos e valores",
		intro: "O Grace tem quatro tipos de valor.",
		itens: [
			{
				id: "numero",
				titulo: "Número",
				descricao:
					"Existe só um tipo de número, sempre com ponto flutuante — não há um tipo separado para números inteiros.\n\nQuando o resultado é um número inteiro, o Grace imprime sem casas decimais (2, não 2.0). Quando não é, imprime as casas decimais normalmente (3.5).",
				exemplo: {
					id: "numero",
					title: "Número",
					code: `imprima(7 / 2);`,
					expect: { kind: "output", lines: ["3.5"] },
				},
			},
			{
				id: "texto",
				titulo: "Texto",
				descricao: "Uma sequência de caracteres entre aspas.",
				exemplo: {
					id: "texto",
					title: "Texto",
					code: `imprima("Grace");`,
					expect: { kind: "output", lines: ["Grace"] },
				},
			},
			{
				id: "logico",
				titulo: "Lógico",
				descricao: "verdadeiro ou falso. Impressos como Verdadeiro e Falso, com maiúscula.",
				exemplo: {
					id: "logico",
					title: "Lógico",
					code: `imprima(verdadeiro);
imprima(falso);`,
					expect: { kind: "output", lines: ["Verdadeiro", "Falso"] },
				},
			},
			{
				id: "nulo-tipo",
				titulo: "Nulo",
				descricao: "Representa a ausência de valor. Impresso como Nulo, com maiúscula.",
				exemplo: {
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
		titulo: "Controle de fluxo",
		itens: [
			{
				id: "se-senao-fluxo",
				titulo: "se / senao",
				sintaxe: "se (condição) { ... } senao { ... }",
				descricao: "Escolhe um entre dois caminhos, dependendo de uma condição.",
				exemplo: {
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
				titulo: "enquanto",
				sintaxe: "enquanto (condição) { ... }",
				descricao: "Repete enquanto a condição continuar verdadeira.",
				exemplo: {
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
				titulo: "para",
				sintaxe: "para (início; condição; atualização) { ... }",
				descricao: "Uma forma compacta de enquanto, para quando o número de repetições é conhecido.",
				exemplo: {
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
		titulo: "Funções",
		itens: [
			{
				id: "declaracao",
				titulo: "Declaração e parâmetros",
				sintaxe: "funcao nome(a, b) { retorna a + b; }",
				descricao: "Uma função tem nome, zero ou mais parâmetros, e um corpo entre chaves.",
				exemplo: {
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
				titulo: "Aninhamento",
				descricao: "Uma função pode ser declarada dentro de outra, e chamada normalmente de lá de dentro.",
				exemplo: {
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
				aviso:
					"O aninhamento não cria um fechamento (closure): a função interna não enxerga as variáveis locais da função externa, só os próprios parâmetros e variáveis. Tentar usar uma variável de fora dá o mesmo erro de \"variável não existe\" que usar uma variável nunca declarada.",
				erroDemonstrado: {
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
				titulo: "Recursão",
				descricao: "Uma função pode chamar a si mesma.",
				exemplo: {
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
				titulo: "Retorno implícito",
				descricao: "Uma função que não usa retorna devolve Nulo automaticamente.",
				exemplo: {
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
		titulo: "Classes",
		itens: [
			{
				id: "declaracao-classe",
				titulo: "classe, var e construtor",
				sintaxe: "classe Nome { var atributo; construtor(...) { ... } }",
				descricao:
					"Toda classe que vai guardar dados precisa declarar cada atributo com var antes de poder usá-lo com este.",
				exemplo: {
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
				titulo: "Herança com <",
				sintaxe: "classe B < A { ... }",
				descricao:
					"Uma classe herda atributos e métodos de outra com <. A subclasse precisa declarar o próprio construtor — mesmo que só repasse os valores com super.construtor(...).",
				exemplo: {
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
		titulo: "Limitações conhecidas",
		intro: "O que o Grace ainda não tem — melhor saber de antemão do que descobrir no meio de um programa.",
		itens: [
			{
				id: "sem-atribuicao-composta",
				titulo: "+= -= *= /= não existem",
				descricao:
					"O scanner reconhece esses símbolos, mas o parser não os aceita em nenhum comando. Escreva x = x + 1; por extenso.",
				exemplo: {
					id: "sem-atribuicao-composta",
					title: "+= não é aceito",
					code: `var x = 1;
x += 5;`,
					expect: { kind: "error" },
				},
			},
			{
				id: "sem-escolha-caso",
				titulo: "escolha / caso não existem",
				descricao: "Não há um comando de múltipla escolha. Use se / senao encadeados.",
				exemplo: {
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
				titulo: '"texto" + número não funciona',
				descricao:
					"O + só soma dois números ou junta dois textos — nunca mistura os dois, e o Grace não converte um número em texto automaticamente. Imprima os dois valores separadamente.",
				exemplo: {
					id: "sem-conversao-texto",
					title: "Misturando tipos",
					code: `imprima("nota: " + 10);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "sem-escapes",
				titulo: "Escapes como \\n não são interpretados",
				descricao: 'O texto entre aspas é copiado ao pé da letra. "linha1\\nlinha2" imprime o \\n literal, não quebra linha.',
				exemplo: {
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
		titulo: "Catálogo de erros",
		intro:
			"A maioria dos erros de sintaxe segue o padrão \"Esperava X, mas encontrei Y\" — o texto já diz o que falta. Esta lista cobre os erros mais específicos, os que valem uma explicação à parte.",
		itens: [
			{
				id: "texto-nao-fechado",
				titulo: "Texto não fechado",
				descricao:
					'Mensagem: "O texto iniciado com \'"\' nunca foi fechado." Significa que uma aspa de abertura não tem par. Feche o texto com outra aspa.',
				exemplo: {
					id: "texto-nao-fechado",
					title: "Aspa sem fechar",
					code: `imprima("abc);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "caractere-nao-reconhecido",
				titulo: "Caractere não reconhecido",
				descricao:
					'Mensagem: "O caractere \'X\' não é reconhecido pela linguagem Grace." Algum símbolo digitado (como @ ou #) não existe na linguagem.',
				exemplo: {
					id: "caractere-nao-reconhecido",
					title: "Símbolo inválido",
					code: `imprima(1 @ 2);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "numero-seguido-de-letra",
				titulo: "Número seguido de letra",
				descricao:
					'Mensagem: "O número \'X\' não pode ser seguido de letras." Nomes de variáveis não podem começar com um número.',
				exemplo: {
					id: "numero-seguido-de-letra",
					title: "Nome inválido",
					code: `var 5x = 1;`,
					expect: { kind: "error" },
				},
			},
			{
				id: "variavel-nao-existe",
				titulo: "Variável não existe",
				descricao:
					'Mensagem: "A variável \'X\' não existe." Você tentou ler uma variável que nunca foi declarada com var.',
				exemplo: {
					id: "variavel-nao-existe",
					title: "Ler sem declarar",
					code: `imprima(naoexiste);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "divisao-por-zero-erro",
				titulo: "Divisão por zero",
				descricao: 'Mensagem: "Não é possível dividir por zero." O denominador de uma divisão era zero.',
				exemplo: {
					id: "divisao-por-zero-erro",
					title: "Dividir por zero",
					code: `imprima(10 / 0);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "operador-mais-incompativel",
				titulo: "Operador + com tipos incompatíveis",
				descricao:
					'Mensagem: "O operador \'+\' funciona com dois números... ou duas strings..." Você tentou somar um texto com um número.',
				exemplo: {
					id: "operador-mais-incompativel",
					title: "Texto + número",
					code: `imprima("a" + 1);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "atributo-nao-declarado-erro",
				titulo: "Atributo não declarado",
				descricao:
					'Mensagem: "O atributo \'X\' não foi declarado na classe \'Y\'." Você usou este.algo sem antes declarar var algo; na classe.',
				exemplo: {
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
				titulo: "Classe sem construtor não aceita argumentos",
				descricao:
					'Mensagem: "A classe \'X\' não tem construtor, então \'X()\' não aceita argumentos." Você passou valores para uma classe que não declarou construtor(...).',
				exemplo: {
					id: "classe-sem-construtor",
					title: "Argumentos sem construtor",
					code: `classe C {}
C(1, 2);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "numero-de-argumentos",
				titulo: "Número errado de argumentos",
				descricao:
					'Mensagem: "A função/O método/O construtor da classe \'X\' espera N argumento(s), mas recebeu M." A chamada não bate com os parâmetros declarados.',
				exemplo: {
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
				titulo: "Superclasse não declarada",
				descricao:
					'Mensagem: "A superclasse \'X\' não foi declarada." A classe usada depois do < em classe B < A ainda não existe.',
				exemplo: {
					id: "superclasse-nao-declarada",
					title: "Herdar de classe inexistente",
					code: `classe B < A {}`,
					expect: { kind: "error" },
				},
			},
			{
				id: "atributo-duplicado-superclasse",
				titulo: "Atributo já declarado na superclasse",
				descricao:
					'Mensagem: "O atributo \'X\' já foi declarado na superclasse \'Y\'." A subclasse repetiu var de um atributo que já vem por herança.',
				exemplo: {
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
				titulo: "'super' fora de um método",
				descricao:
					'Mensagem: "\'super\' só pode ser usado dentro de um método de uma classe." super só existe dentro do corpo de um método.',
				exemplo: {
					id: "super-fora-de-metodo",
					title: "super no topo do programa",
					code: `imprima(super.foo);`,
					expect: { kind: "error" },
				},
			},
			{
				id: "classe-sem-superclasse",
				titulo: "Classe não herda de ninguém",
				descricao:
					'Mensagem: "A classe \'X\' não herda de ninguém, então não é possível usar \'super\' aqui." super foi usado numa classe que não tem <.',
				exemplo: {
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
				titulo: "Método não existe na superclasse",
				descricao:
					'Mensagem: "O método \'X\' não existe na superclasse \'Y\'." O nome depois de super. não é um método da classe de cima.',
				exemplo: {
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
				titulo: "Limite de passos (laço infinito)",
				descricao:
					'Mensagem: "O programa passou de 1.000.000 de passos e foi interrompido." Normalmente significa que a condição de um enquanto nunca fica falsa.',
				exemplo: {
					id: "limite-de-passos",
					title: "Laço sem fim",
					code: `enquanto (verdadeiro) {}`,
					expect: { kind: "error" },
				},
			},
		],
	},
];
