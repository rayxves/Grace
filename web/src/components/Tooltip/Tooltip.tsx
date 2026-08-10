import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Tooltip.module.css";

interface TooltipProps {
	content: string;
	children: ReactNode;
}

const SHOW_DELAY_MS = 400;
const BUBBLE_HEIGHT_ESTIMATE = 140;

export function Tooltip({ content, children }: Readonly<TooltipProps>) {
	const [visible, setVisible] = useState(false);
	const [placement, setPlacement] = useState<"below" | "above">("below");
	const timeoutRef = useRef<number | null>(null);
	const wrapperRef = useRef<HTMLSpanElement>(null);

	function show() {
		timeoutRef.current = window.setTimeout(() => {
			const rect = wrapperRef.current?.getBoundingClientRect();
			if (rect && rect.bottom + BUBBLE_HEIGHT_ESTIMATE > window.innerHeight) {
				setPlacement("above");
			} else {
				setPlacement("below");
			}
			setVisible(true);
		}, SHOW_DELAY_MS);
	}

	function hide() {
		if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
		setVisible(false);
	}

	useEffect(() => {
		return () => {
			if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
		};
	}, []);

	const bubbleClass =
		placement === "above" ? `${styles.bubble} ${styles.bubbleAbove}` : styles.bubble;

	return (
		<span
			ref={wrapperRef}
			className={styles.wrapper}
			onMouseEnter={show}
			onMouseLeave={hide}
			onFocus={show}
			onBlur={hide}
		>
			{children}
			{visible && (
				<span role="tooltip" className={bubbleClass}>
					{content}
				</span>
			)}
		</span>
	);
}
