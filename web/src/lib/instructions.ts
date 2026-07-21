import type { Step } from "../types";

export interface StepExplanation {
	summary: string;
	popped: string[];
	pushed: string[];
}

interface StepContext {
	popped: string[];
	pushed: string[];
	top: string | undefined;
}

const fallbackDescriptions: Record<string, string> = {
	retorna: "encerra a função atual e devolve o valor do topo da pilha",
	constante: "empilha um valor constante do programa",
	"nega número": "troca o sinal do número no topo da pilha",
	soma: "desempilha dois valores e empilha a soma deles",
	subtrai: "desempilha dois valores e empilha a diferença",
	multiplica: "desempilha dois valores e empilha o produto",
	divide: "desempilha dois valores e empilha a divisão",
	imprime: "desempilha o valor do topo e o exibe na saída",
	"descarta topo": "remove o valor do topo da pilha",
	"define global": "cria uma variável global com o valor do topo",
	"lê global": "busca o valor de uma variável global e o empilha",
	"atribui global": "guarda o valor do topo em uma variável global",
	verdadeiro: "empilha o valor lógico Verdadeiro",
	falso: "empilha o valor lógico Falso",
	nulo: "empilha o valor Nulo",
	"nega lógico": "inverte o valor lógico do topo da pilha",
	igual: "compara os dois valores do topo e empilha o resultado",
	maior: "verifica se o penúltimo valor é maior que o último",
	menor: "verifica se o penúltimo valor é menor que o último",
	salta: "pula para outra instrução do programa",
	"salta se falso": "pula um trecho do programa se o topo for falso",
	"volta (laço)": "retorna ao início do laço para repetir",
	"lê local": "copia o valor de uma variável local para o topo",
	"atribui local": "guarda o valor do topo em uma variável local",
	chama: "invoca uma função com os argumentos empilhados",
	"lê atributo": "busca um atributo do objeto no topo da pilha",
	"atribui atributo": "guarda um valor em um atributo do objeto",
	"lê método da superclasse": "busca um método na superclasse",
};

function stackDiff(previous: string[], current: string[]) {
	let common = 0;
	while (
		common < previous.length &&
		common < current.length &&
		previous[common] === current[common]
	) {
		common++;
	}
	return { popped: previous.slice(common), pushed: current.slice(common) };
}

type Summarizer = (context: StepContext) => string | null;

function binaryOperation(symbol: string, verb: string): Summarizer {
	return ({ popped, pushed }) =>
		popped.length === 2 && pushed.length === 1
			? `${verb} ${popped[0]} ${symbol} ${popped[1]} e empilhou ${pushed[0]}`
			: null;
}

const pushedValue: Summarizer = ({ pushed }) =>
	pushed.length ? `colocou o valor ${pushed[0]} no topo da pilha` : null;

const readVariable = (scope: string): Summarizer =>
	({ pushed }) =>
		pushed.length
			? `copiou o valor ${pushed[0]} de uma variável ${scope} para o topo da pilha`
			: null;

const writeVariable = (scope: string): Summarizer =>
	({ top }) =>
		top !== undefined
			? `guardou o valor ${top} na variável ${scope} (o valor continua na pilha)`
			: null;

const summarizers: Record<string, Summarizer> = {
	soma: binaryOperation("+", "calculou"),
	subtrai: binaryOperation("-", "calculou"),
	multiplica: binaryOperation("*", "calculou"),
	divide: binaryOperation("/", "calculou"),
	menor: binaryOperation("<", "comparou"),
	maior: binaryOperation(">", "comparou"),
	igual: binaryOperation("==", "comparou"),
	constante: pushedValue,
	verdadeiro: pushedValue,
	falso: pushedValue,
	nulo: pushedValue,
	imprime: ({ popped }) =>
		popped.length
			? `tirou ${popped[0]} da pilha e escreveu na saída do programa`
			: null,
	"define global": ({ popped }) =>
		popped.length
			? `tirou ${popped[0]} da pilha e guardou na variável que acabou de ser declarada`
			: null,
	"lê global": readVariable("global"),
	"atribui global": writeVariable("global"),
	"lê local": readVariable("local"),
	"atribui local": writeVariable("local"),
	"salta se falso": ({ top }) => {
		if (top === undefined) return null;
		return top === "Falso"
			? `olhou o topo da pilha (${top}) e, por ser falso, pulou o bloco inteiro`
			: `olhou o topo da pilha (${top}) e, por ser verdadeiro, entrou no bloco`;
	},
	salta: () =>
		"pulou direto para outro ponto do programa, sem testar condição",
	"volta (laço)": () =>
		"voltou ao início do laço para testar a condição outra vez",
	"descarta topo": ({ popped }) =>
		popped.length
			? `removeu ${popped[0]} do topo da pilha, que não era mais necessário`
			: null,
	"nega número": ({ popped, pushed }) =>
		popped.length && pushed.length
			? `trocou o sinal de ${popped[0]} e empilhou ${pushed[0]}`
			: null,
	"nega lógico": ({ popped, pushed }) =>
		popped.length && pushed.length
			? `inverteu ${popped[0]} e empilhou ${pushed[0]}`
			: null,
	chama: () =>
		"chamou a função usando os argumentos que estão no topo da pilha",
	retorna: ({ top }) =>
		top !== undefined
			? `encerrou a função e deixou o resultado ${top} no topo da pilha`
			: "encerrou a função atual",
	"lê atributo": ({ pushed }) =>
		pushed.length
			? `buscou o atributo do objeto e empilhou ${pushed[0]}`
			: null,
};

export function explainStep(step: Step, previous: Step | null): StepExplanation {
	const { popped, pushed } = stackDiff(previous?.stack ?? [], step.stack);
	const context: StepContext = { popped, pushed, top: step.stack.at(-1) };
	const summary =
		summarizers[step.instruction]?.(context) ??
		fallbackDescriptions[step.instruction] ??
		"executou uma instrução da máquina virtual";
	return { summary, popped, pushed };
}

export function collectOutput(steps: Step[], upToIndex: number): string[] {
	const lines: string[] = [];
	for (let i = 1; i <= upToIndex && i < steps.length; i++) {
		if (steps[i].instruction === "imprime") {
			const value = steps[i - 1].stack.at(-1);
			if (value !== undefined) lines.push(value);
		}
	}
	return lines;
}
