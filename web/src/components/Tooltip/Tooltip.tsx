import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Tooltip.module.css";

interface TooltipProps {
	content: string;
	children: ReactNode;
}

const SHOW_DELAY_MS = 400;

export function Tooltip({ content, children }: Readonly<TooltipProps>) {
	const [visible, setVisible] = useState(false);
	const timeoutRef = useRef<number | null>(null);

	function show() {
		timeoutRef.current = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
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

	return (
		<span
			className={styles.wrapper}
			onMouseEnter={show}
			onMouseLeave={hide}
			onFocus={show}
			onBlur={hide}
		>
			{children}
			{visible && (
				<span role="tooltip" className={styles.bubble}>
					{content}
				</span>
			)}
		</span>
	);
}
