import type { AstNode } from "../types";
import type { Beat } from "./beats";
import { explainCompileStep } from "./compileNarration";
import { describeScopeResolution } from "./scopeLookup";
import { displayLabel } from "./astLabels";

export interface BeatExplanation {
	summary: string;
}

export function explainScanStep(text: string): BeatExplanation {
	return { summary: `separou o token "${text}" do texto-fonte` };
}

export function explainResolveStep(
	nodeId: number,
	scopeDepth: number,
	astIndex: Map<number, AstNode>,
): BeatExplanation {
	const node = astIndex.get(nodeId);
	const label = node ? displayLabel(node.kind, node.label) : "";
	const description = describeScopeResolution({ name: "", depth: scopeDepth });
	return { summary: `variável "${label}": ${description}` };
}

export function explainBeat(
	beat: Beat,
	astIndex: Map<number, AstNode>,
	emitCountByNode: Map<number, number>,
): BeatExplanation {
	switch (beat.phase) {
		case "scan":
			return explainScanStep(beat.text);
		case "resolve":
			return explainResolveStep(beat.nodeId, beat.scopeDepth, astIndex);
		case "parse":
			return explainCompileStep(
				{ kind: "enter", nodeId: beat.nodeId, nodeKind: beat.nodeKind, line: beat.line },
				astIndex,
				emitCountByNode,
			);
		case "compile":
			return explainCompileStep(
				{ kind: "emit", nodeId: beat.nodeId, offset: beat.offset, opcode: beat.opcode, line: beat.line },
				astIndex,
				emitCountByNode,
			);
		default:
			return { summary: "" };
	}
}
