export function parseErrorLine(message: string | null): number | null {
	if (message === null) return null;
	const match = /^Linha (\d+)/.exec(message);
	return match ? Number(match[1]) : null;
}
