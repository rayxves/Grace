import type { AstNode, CompileStep } from "../types";
import { displayKind, displayLabel } from "./astLabels";

export interface CompileStepExplanation {
	summary: string;
}

const CHILDLESS_KINDS = new Set(["Literal", "Variable", "This", "Super"]);

const COMPOUND_COMPARISONS: Record<string, string> = {
	BangEqual: "diferente",
	GreaterEqual: "maior ou igual",
	LessEqual: "menor ou igual",
};

function enterSummary(nodeKind: string, node: AstNode | undefined): string {
	const label = node ? displayLabel(node.kind, node.label) : "";
	switch (nodeKind) {
		case "Binary":
			return `entrou na operação "${label}" para compilar os dois lados`;
		case "Logical":
			return `entrou na operação lógica "${label}" para compilar os dois lados, com curto-circuito`;
		case "Unary":
			return `entrou na operação unária "${label}" para compilar o valor`;
		case "Literal":
			return `entrou no valor literal ${label || "(sem valor)"}`;
		case "Grouping":
			return "entrou nos parênteses";
		case "Variable":
			return `entrou na leitura da variável "${label}"`;
		case "Assign":
			return `entrou na atribuição para a variável "${label}"`;
		case "Call":
			return "entrou na chamada de função para compilar o alvo e os argumentos";
		case "Get":
			return `entrou na leitura do atributo "${label}"`;
		case "Set":
			return `entrou na atribuição do atributo "${label}"`;
		case "This":
			return 'entrou no "este"';
		case "Super":
			return 'entrou no "super"';
		case "Print":
			return "entrou no imprima para compilar o valor a exibir";
		case "ExprStmt":
			return "entrou na expressão do comando";
		case "VarDecl":
			return `entrou na declaração da variável "${label}"`;
		case "Block":
			return "entrou no bloco de comandos";
		case "If":
			return "entrou no condicional para compilar a comparação e os blocos";
		case "While":
			return "entrou no laço para compilar a condição e o corpo";
		case "Function":
			return `entrou na função "${label}" para compilar o corpo`;
		case "Return":
			return "entrou no retorna";
		case "Class":
			return `entrou na classe "${label}" para compilar os métodos`;
		default:
			return `entrou em ${displayKind(nodeKind)}`;
	}
}

function emitSummary(nodeKind: string, opcode: string): string {
	if (nodeKind === "Binary" || nodeKind === "Logical") {
		return `terminou de compilar os dois lados e emitiu a instrução "${opcode}"`;
	}
	if (nodeKind === "Unary") {
		return `terminou de compilar o valor e emitiu a instrução "${opcode}"`;
	}
	if (CHILDLESS_KINDS.has(nodeKind)) {
		return `emitiu a instrução "${opcode}" para colocar o valor na pilha`;
	}
	return `terminou de compilar esta parte da árvore e emitiu a instrução "${opcode}"`;
}

function exitSummary(
	nodeKind: string,
	node: AstNode | undefined,
	emitCount: number,
): string {
	if (nodeKind === "Grouping") {
		return "os parênteses organizaram a árvore, mas não viraram instrução nenhuma — eles já fizeram o trabalho deles";
	}
	if (nodeKind === "Binary" && node) {
		const compound = COMPOUND_COMPARISONS[node.label];
		if (compound) {
			return `o Grace não tem uma instrução de "${compound}" — ele compara e nega, por isso saíram ${emitCount} instruções daqui`;
		}
	}
	if (emitCount === 0) return "este nó não emitiu nenhuma instrução própria";
	if (emitCount === 1) return "este nó gerou 1 instrução";
	return `este nó gerou ${emitCount} instruções`;
}

export function explainCompileStep(
	step: CompileStep,
	astIndex: Map<number, AstNode>,
	emitCountByNode: Map<number, number>,
): CompileStepExplanation {
	switch (step.kind) {
		case "enter":
			return { summary: enterSummary(step.nodeKind, astIndex.get(step.nodeId)) };
		case "emit": {
			const node = step.nodeId !== null ? astIndex.get(step.nodeId) : undefined;
			return { summary: emitSummary(node?.kind ?? "", step.opcode) };
		}
		case "exit": {
			const node = astIndex.get(step.nodeId);
			const count = emitCountByNode.get(step.nodeId) ?? 0;
			return { summary: exitSummary(node?.kind ?? "", node, count) };
		}
		case "patch":
			return {
				summary:
					"voltou para preencher o destino de um salto que tinha ficado em aberto — agora o compilador já sabe para onde pular",
			};
		default:
			return { summary: "" };
	}
}

export function countEmitsByNode(compileSteps: CompileStep[]): Map<number, number> {
	const counts = new Map<number, number>();
	for (const step of compileSteps) {
		if (step.kind === "emit" && step.nodeId !== null) {
			counts.set(step.nodeId, (counts.get(step.nodeId) ?? 0) + 1);
		}
	}
	return counts;
}
