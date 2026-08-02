import type { Trace } from "../types";
import { buildAstNodeIndex } from "./astIndex";

export type Beat =
	| { phase: "scan"; line: number; text: string; tokenKind: string }
	| { phase: "parse"; line: number; nodeId: number; nodeKind: string; compileStepIndex: number }
	| { phase: "resolve"; line: number; nodeId: number; scopeDepth: number }
	| {
			phase: "compile";
			line: number;
			nodeId: number | null;
			opcode: string;
			offset: number;
			compileStepIndex: number;
	  };

export function buildBeats(trace: Trace): Beat[] {
	const astIndex = buildAstNodeIndex(trace.ast);
	const resolveByNode = new Map<number, number>();
	for (const step of trace.resolveSteps) {
		if (step.kind === "resolve") resolveByNode.set(step.id, step.depth);
	}

	const tokens = trace.tokens.filter((token) => token.kind !== "EOF");
	let nextTokenIndex = 0;
	const beats: Beat[] = [];

	function flushScanUpTo(line: number) {
		while (nextTokenIndex < tokens.length && tokens[nextTokenIndex].line <= line) {
			const token = tokens[nextTokenIndex];
			beats.push({ phase: "scan", line: token.line, text: token.text || token.kind, tokenKind: token.kind });
			nextTokenIndex++;
		}
	}

	trace.compileSteps.forEach((step, compileStepIndex) => {
		if (step.kind === "enter") {
			const line = step.line ?? astIndex.get(step.nodeId)?.line ?? 0;
			flushScanUpTo(line);
			beats.push({ phase: "parse", line, nodeId: step.nodeId, nodeKind: step.nodeKind, compileStepIndex });
			const scopeDepth = resolveByNode.get(step.nodeId);
			if (scopeDepth !== undefined) {
				beats.push({ phase: "resolve", line, nodeId: step.nodeId, scopeDepth });
			}
		} else if (step.kind === "emit") {
			flushScanUpTo(step.line);
			beats.push({
				phase: "compile",
				line: step.line,
				nodeId: step.nodeId,
				opcode: step.opcode,
				offset: step.offset,
				compileStepIndex,
			});
		}
	});

	flushScanUpTo(Number.POSITIVE_INFINITY);

	return beats;
}

export function compileStepIndexAt(beats: Beat[], beatIndex: number): number {
	let index = -1;
	for (let i = 0; i <= beatIndex && i < beats.length; i++) {
		const beat = beats[i];
		if (beat.phase === "parse" || beat.phase === "compile") index = beat.compileStepIndex;
	}
	return index;
}
