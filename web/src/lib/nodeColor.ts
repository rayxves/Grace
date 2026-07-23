const GOLDEN_ANGLE = 137.508;

export function hueForNodeId(nodeId: number): number {
	return (nodeId * GOLDEN_ANGLE) % 360;
}

export function nodeAccentColor(nodeId: number | null): string | undefined {
	if (nodeId === null) return undefined;
	return `hsl(${hueForNodeId(nodeId).toFixed(1)}deg 55% 50%)`;
}

export function nodeAccentFill(nodeId: number | null, alpha = 0.16): string | undefined {
	if (nodeId === null) return undefined;
	return `hsl(${hueForNodeId(nodeId).toFixed(1)}deg 55% 50% / ${alpha})`;
}
