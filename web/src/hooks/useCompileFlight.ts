import { useEffect, useRef, useState } from "react";
import type { CompileStep } from "../types";
import { hueForNodeId } from "../lib/nodeColor";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export interface Flight {
	key: string;
	text: string;
	hue: number;
	from: { x: number; y: number };
	to: { x: number; y: number };
}

function centerOf(rect: DOMRect) {
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function useCompileFlight(active: boolean, index: number, steps: CompileStep[]) {
	const prevIndexRef = useRef(index);
	const [flight, setFlight] = useState<Flight | null>(null);
	const reducedMotion = usePrefersReducedMotion();

	useEffect(() => {
		const previous = prevIndexRef.current;
		prevIndexRef.current = index;

		if (!active || reducedMotion) return;
		if (index !== previous + 1) return;

		const step = steps[index];
		if (!step || step.kind !== "emit") return;

		const fromNodeId = step.nodeId;
		if (fromNodeId === null) return;

		const fromEl = document.querySelector(`[data-role="ast-panel"] [data-node-id="${fromNodeId}"]`);
		const toEl = document.querySelector(`[data-role="bytecode-panel"] [data-offset="${step.offset}"]`);
		if (!fromEl || !toEl) return;

		const fromRect = fromEl.getBoundingClientRect();
		const toRect = toEl.getBoundingClientRect();

		setFlight({
			key: `${step.offset}-${index}`,
			text: step.opcode,
			hue: hueForNodeId(fromNodeId),
			from: centerOf(fromRect),
			to: { x: toRect.left + 12, y: toRect.top + toRect.height / 2 },
		});
	}, [active, index, steps, reducedMotion]);

	return flight;
}
