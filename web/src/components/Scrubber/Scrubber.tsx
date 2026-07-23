import styles from "./Scrubber.module.css";

export interface ScrubberMarker {
	index: number;
	kind: "print" | "loop";
	title: string;
}

interface ScrubberProps {
	length: number;
	index: number;
	onSeek: (index: number) => void;
	markers?: ScrubberMarker[];
}

export function Scrubber({
	length,
	index,
	onSeek,
	markers = [],
}: Readonly<ScrubberProps>) {
	const lastIndex = Math.max(0, length - 1);

	return (
		<div className={styles.scrubber}>
			<input
				type="range"
				className={styles.track}
				min={0}
				max={lastIndex}
				value={index}
				disabled={length === 0}
				onChange={(event) => onSeek(Number(event.target.value))}
				aria-label="navegar pelos passos"
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
						title={marker.title}
					/>
				))}
			</div>
		</div>
	);
}
