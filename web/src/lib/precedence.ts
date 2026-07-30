const LEVELS: { symbols: string[]; label: string }[] = [
	{ symbols: ["ou"], label: "ou" },
	{ symbols: ["e"], label: "e" },
	{ symbols: ["==", "!="], label: "igualdade (==, !=)" },
	{ symbols: [">", ">=", "<", "<="], label: "comparação (>, >=, <, <=)" },
	{ symbols: ["+", "-"], label: "soma/subtração (+, -)" },
	{ symbols: ["*", "/"], label: "multiplicação/divisão (*, /)" },
];

export function explainPrecedence(symbol: string): string | null {
	const index = LEVELS.findIndex((level) => level.symbols.includes(symbol));
	if (index === -1) return null;

	const current = LEVELS[index];
	const below = LEVELS[index - 1];
	const above = LEVELS[index + 1];

	const parts = [`"${symbol}" é do nível de ${current.label}, precedência ${index + 1} de ${LEVELS.length} (1 = menor, ${LEVELS.length} = maior).`];
	if (above) parts.push(`Resolvido depois de ${above.label}.`);
	if (below) parts.push(`Resolvido antes de ${below.label}.`);
	return parts.join(" ");
}
