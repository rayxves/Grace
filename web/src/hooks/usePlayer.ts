import { useState, useEffect, useCallback } from "react";

const BASE_INTERVAL_MS = 800;
export const PLAYER_SPEEDS = [0.25, 0.5, 1, 2, 4] as const;

export function usePlayer<T>(steps: T[], getLine: (step: T) => number | null) {
	const [index, setIndex] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [speed, setSpeed] = useState<number>(1);

	const [lastSteps, setLastSteps] = useState(steps);
	if (lastSteps !== steps) {
		setLastSteps(steps);
		if (index !== 0) setIndex(0);
		if (playing) setPlaying(false);
	}

	const lastIndex = Math.max(0, steps.length - 1);

	const next = useCallback(() => {
		setIndex((i) => Math.min(i + 1, lastIndex));
	}, [lastIndex]);

	const previous = useCallback(() => {
		setIndex((i) => Math.max(i - 1, 0));
	}, []);

	const goTo = useCallback(
		(target: number) => {
			setIndex(Math.min(Math.max(target, 0), lastIndex));
		},
		[lastIndex],
	);

	const nextLine = useCallback(() => {
		setIndex((current) => {
			if (current >= lastIndex) return current;
			const currentLine = getLine(steps[current]);
			if (currentLine === null) return current + 1;
			let i = current + 1;
			while (i < lastIndex && getLine(steps[i]) === currentLine) {
				i++;
			}
			return i;
		});
	}, [steps, lastIndex, getLine]);

	const togglePlay = useCallback(() => {
		setPlaying((p) => !p);
	}, []);

	const reset = useCallback(() => {
		setIndex(0);
		setPlaying(false);
	}, []);

	useEffect(() => {
		if (!playing) return;
		const timer = setTimeout(() => {
			setIndex((i) => {
				const nextIndex = Math.min(i + 1, lastIndex);
				if (nextIndex >= lastIndex) setPlaying(false);
				return nextIndex;
			});
		}, BASE_INTERVAL_MS / speed);
		return () => clearTimeout(timer);
	}, [playing, index, lastIndex, speed]);

	return {
		index,
		currentStep: steps[index] ?? null,
		playing,
		speed,
		setSpeed,
		next,
		previous,
		goTo,
		nextLine,
		togglePlay,
		reset,
		total: steps.length,
	};
}
