import { useState, useEffect, useCallback } from "react";
import type { Step } from "./types";

export function usePlayer(steps: Step[]) {
	const [index, setIndex] = useState(0);
	const [playing, setPlaying] = useState(false);

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

	const nextLine = useCallback(() => {
		setIndex((current) => {
			if (current >= lastIndex) return current;
			const currentLine = steps[current]?.line;
			let i = current + 1;
			while (i < lastIndex && steps[i]?.line === currentLine) {
				i++;
			}
			return i;
		});
	}, [steps, lastIndex]);

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
		}, 800);
		return () => clearTimeout(timer);
	}, [playing, index, lastIndex]);

	return {
		index,
		currentStep: steps[index] ?? null,
		playing,
		next,
		previous,
		nextLine,
		togglePlay,
		reset,
		total: steps.length,
	};
}
