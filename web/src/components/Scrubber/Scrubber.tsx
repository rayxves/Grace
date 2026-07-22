import { useMemo } from "react";
import type { Step } from "../../types";
import styles from "./Scrubber.module.css";

interface ScrubberProps {
	steps: Step[];
	index: number;
	onSeek: (index: number) => void;
}

interface Marker {
	index: number;
	kind: "print" | "loop";
}

export function Scrubber({ steps, index, onSeek }: Readonly<ScrubberProps>) {
	const lastIndex = Math.max(0, steps.length - 1);

	const markers = useMemo(() => {
		const found: Marker[] = [];
		steps.forEach((step, i) => {
			if (step.instruction === "imprime") {
				found.push({ index: i, kind: "print" });
			} else if (step.instruction === "volta (laço)") {
				found.push({ index: i, kind: "loop" });
			}
		});
		return found;
	}, [steps]);

	return (
		<div className={styles.scrubber}>
			<input
				type="range"
				className={styles.track}
				min={0}
				max={lastIndex}
				value={index}
				disabled={steps.length === 0}
				onChange={(event) => onSeek(Number(event.target.value))}
				aria-label="navegar pelos passos da execução"
			/>
			<div className={styles.markers}>
				{markers.map((marker) => (
					<span
						key={`${marker.kind}-${marker.index}`}
						className={
							marker.kind === "print" ? styles.markerPrint : styles.markerLoop
						}
						style={{
							left: `${lastIndex > 0 ? (marker.index / lastIndex) * 100 : 0}%`,
						}}
						title={
							marker.kind === "print"
								? `passo ${marker.index + 1}: imprime`
								: `passo ${marker.index + 1}: volta do laço`
						}
					/>
				))}
			</div>
		</div>
	);
}
