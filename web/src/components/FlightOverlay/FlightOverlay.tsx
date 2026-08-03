import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FlightState } from "../../hooks/useFlight";
import styles from "./FlightOverlay.module.css";

interface FlightOverlayProps {
	flight: FlightState | null;
}

function Chip({ flight }: Readonly<{ flight: FlightState }>) {
	const total = flight.moveMs + flight.holdMs + flight.fadeMs;
	const moveEnd = flight.moveMs / total;
	const holdEnd = (flight.moveMs + flight.holdMs) / total;
	const dx = flight.instant ? 0 : flight.to.x - flight.from.x;
	const dy = flight.instant ? 0 : flight.to.y - flight.from.y;

	return (
		<motion.div
			className={styles.chip}
			style={
				{
					left: flight.instant ? flight.to.x : flight.from.x,
					top: flight.instant ? flight.to.y : flight.from.y,
					"--flight-color": flight.color ?? "var(--color-accent)",
				} as CSSProperties
			}
			initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
			animate={{
				x: [0, dx, dx, dx],
				y: [0, dy, dy, dy],
				opacity: [0, 1, 1, 0],
				scale: [0.6, 1.2, 1.2, 0.9],
			}}
			exit={{ opacity: 0 }}
			transition={{ duration: total / 1000, times: [0, moveEnd, holdEnd, 1], ease: "easeOut" }}
		>
			<span className={styles.dot} />
			<span className={styles.label}>{flight.label}</span>
		</motion.div>
	);
}

export function FlightOverlay({ flight }: Readonly<FlightOverlayProps>) {
	return <AnimatePresence>{flight && <Chip key={flight.key} flight={flight} />}</AnimatePresence>;
}
