import { useEffect, type CSSProperties } from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { Flight } from "../../hooks/useCompileFlight";
import styles from "./CompileChipLayer.module.css";

interface CompileChipLayerProps {
	flight: Flight | null;
}

export function CompileChipLayer({ flight }: Readonly<CompileChipLayerProps>) {
	const controls = useAnimationControls();

	useEffect(() => {
		if (!flight) return;
		controls.stop();
		controls.set({ x: flight.from.x, y: flight.from.y, opacity: 0, scale: 0.7 });
		const times = [0, 0.12, 0.4, 0.85, 1];
		controls.start({
			x: [flight.from.x, flight.from.x, flight.from.x, flight.to.x, flight.to.x],
			y: [flight.from.y, flight.from.y, flight.from.y, flight.to.y, flight.to.y],
			opacity: [0, 1, 1, 1, 0],
			scale: [0.7, 1.15, 1, 1, 0.8],
			transition: { duration: 2, times, ease: "easeInOut" },
		});
	}, [flight, controls]);

	if (!flight) return null;

	return (
		<motion.div
			key="compile-chip"
			className={styles.chip}
			style={{ "--chip-hue": flight.hue } as CSSProperties}
			animate={controls}
		>
			{flight.text}
		</motion.div>
	);
}
