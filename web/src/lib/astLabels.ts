const operatorLabels: Record<string, string> = {
	Plus: "+",
	Minus: "-",
	Star: "*",
	Slash: "/",
	EqualEqual: "==",
	BangEqual: "!=",
	Greater: ">",
	GreaterEqual: ">=",
	Less: "<",
	LessEqual: "<=",
	Bang: "!",
	And: "e",
	Or: "ou",
};

const kindLabels: Record<string, string> = {
	Programa: "programa",
	VarDecl: "declara variável",
	Print: "imprima",
	Binary: "operação",
	Literal: "valor",
	Variable: "variável",
	If: "condicional",
	While: "laço",
	For: "laço",
	Function: "função",
	Class: "classe",
	Call: "chamada",
	Get: "lê atributo",
	Set: "atribui atributo",
	This: "este",
	Super: "super",
	Return: "retorna",
	Block: "bloco",
	ExprStmt: "expressão",
	Assign: "atribuição",
	Logical: "operação lógica",
	Unary: "operação unária",
	Grouping: "parênteses",
};

const operatorKinds = new Set(["Binary", "Unary", "Logical"]);

export function displayKind(kind: string): string {
	return kindLabels[kind] ?? kind;
}

export function displayLabel(kind: string, label: string): string {
	if (operatorKinds.has(kind)) return operatorLabels[label] ?? label;
	if (label === "") return displayKind(kind);
	return label;
}
