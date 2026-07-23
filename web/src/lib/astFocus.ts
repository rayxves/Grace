import { hierarchy, tree as d3tree } from "d3-hierarchy";
import type { RawNodeDatum } from "react-d3-tree";

export function findNodeById(
	node: RawNodeDatum,
	nodeId: number,
): RawNodeDatum | null {
	if (node.attributes?.nodeId === nodeId) return node;
	for (const child of node.children ?? []) {
		const found = findNodeById(child, nodeId);
		if (found) return found;
	}
	return null;
}

export function locateNode(
	root: RawNodeDatum,
	target: RawNodeDatum,
	nodeSize: { x: number; y: number },
	separation: { siblings: number; nonSiblings: number },
): { x: number; y: number } | null {
	const layout = d3tree<RawNodeDatum>()
		.nodeSize([nodeSize.x, nodeSize.y])
		.separation((a, b) =>
			a.parent === b.parent ? separation.siblings : separation.nonSiblings,
		);
	const laidOut = layout(hierarchy(root, (node) => node.children));
	const match = laidOut.descendants().find((node) => node.data === target);
	return match ? { x: match.x, y: match.y } : null;
}
