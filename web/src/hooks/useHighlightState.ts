import { useMemo } from "react";
import type { Step, Trace } from "../types";
import { buildNodeLineMap, findNodeIdByOffset } from "../lib/nodeLookup";

interface HighlightStateOptions {
	hasTrace: boolean;
	errorReached: boolean;
	currentStep: Step | null;
	errorLine: number | null;
	errorOffset: number | null;
	bytecode: Trace["bytecode"];
	hoveredNodeId: number | null;
}

export function useHighlightState({
	hasTrace,
	errorReached,
	currentStep,
	errorLine,
	errorOffset,
	bytecode,
	hoveredNodeId,
}: Readonly<HighlightStateOptions>) {
	const gatedCurrentLine = hasTrace ? (currentStep?.line ?? null) : null;
	const gatedCurrentNodeId = hasTrace ? (currentStep?.nodeId ?? null) : null;
	const gatedErrorLine = errorReached ? errorLine : null;
	const gatedErrorOffset = errorReached ? errorOffset : null;

	const nodeLineById = useMemo(() => buildNodeLineMap(bytecode), [bytecode]);
	const gatedErrorNodeId = useMemo(
		() => findNodeIdByOffset(bytecode, gatedErrorOffset),
		[bytecode, gatedErrorOffset],
	);
	const hoverLine =
		hoveredNodeId !== null ? (nodeLineById.get(hoveredNodeId) ?? null) : null;

	return {
		gatedCurrentLine,
		gatedCurrentNodeId,
		gatedErrorLine,
		gatedErrorOffset,
		gatedErrorNodeId,
		hoverLine,
	};
}
