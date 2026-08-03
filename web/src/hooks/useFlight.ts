import { useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export interface FlightState {
	key: string;
	from: { x: number; y: number };
	to: { x: number; y: number };
	label: string;
	color?: string;
	moveMs: number;
	holdMs: number;
	fadeMs: number;
	instant: boolean;
}

export interface FlightTrigger {
	key: string;
	fromSelector: string;
	toSelector: string;
	label: string;
	color?: string;
	delayMs?: number;
}

const MOVE_MIN_MS = 260;
const MOVE_BASE_MS = 520;
const HOLD_MS = 500;
const FADE_MS = 200;

export function moveDuration(speed: number): number {
	return Math.max(MOVE_MIN_MS, MOVE_BASE_MS / speed);
}

export function useFlight(
	containerRef: RefObject<HTMLElement | null>,
	trigger: FlightTrigger | null,
	speed: number,
) {
	const [flight, setFlight] = useState<FlightState | null>(null);
	const reducedMotion = usePrefersReducedMotion();
	const lastKeyRef = useRef<string | null>(null);
	const triggerRef = useRef(trigger);
	const speedRef = useRef(speed);

	useEffect(() => {
		triggerRef.current = trigger;
		speedRef.current = speed;
	});

	const key = trigger?.key ?? null;

	useEffect(() => {
		if (key === null || key === lastKeyRef.current) return;
		lastKeyRef.current = key;

		const startingTrigger = triggerRef.current;
		if (!startingTrigger) return;
		const delayMs = reducedMotion ? 0 : (startingTrigger.delayMs ?? 0);

		let cleanupTimer: number | undefined;

		const startTimer = window.setTimeout(() => {
			const activeTrigger = triggerRef.current;
			if (activeTrigger?.key !== key) return;

			const container = containerRef.current;
			if (!container) return;
			const fromEl = container.querySelector(activeTrigger.fromSelector);
			const toEl = container.querySelector(activeTrigger.toSelector);
			if (!fromEl || !toEl) return;

			const containerRect = container.getBoundingClientRect();
			const fromRect = fromEl.getBoundingClientRect();
			const toRect = toEl.getBoundingClientRect();
			const moveMs = reducedMotion ? 0 : moveDuration(speedRef.current);

			setFlight({
				key: activeTrigger.key,
				from: {
					x: fromRect.left + fromRect.width / 2 - containerRect.left,
					y: fromRect.top + fromRect.height / 2 - containerRect.top,
				},
				to: {
					x: toRect.left + toRect.width / 2 - containerRect.left,
					y: toRect.top + toRect.height / 2 - containerRect.top,
				},
				label: activeTrigger.label,
				color: activeTrigger.color,
				moveMs,
				holdMs: HOLD_MS,
				fadeMs: FADE_MS,
				instant: reducedMotion,
			});

			const totalMs = moveMs + HOLD_MS + FADE_MS;
			cleanupTimer = window.setTimeout(() => setFlight(null), totalMs);
		}, delayMs);

		return () => {
			window.clearTimeout(startTimer);
			if (cleanupTimer !== undefined) window.clearTimeout(cleanupTimer);
		};
	}, [key, containerRef, reducedMotion]);

	return flight;
}
