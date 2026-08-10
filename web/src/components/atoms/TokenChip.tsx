import type { CSSProperties } from "react";
import styles from "./TokenChip.module.css";

interface TokenChipProps {
	text: string;
	color?: string;
	active?: boolean;
	dimmed?: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

export function TokenChip({
	text,
	color,
	active = false,
	dimmed = false,
	onMouseEnter,
	onMouseLeave,
}: Readonly<TokenChipProps>) {
	const classNames = [styles.token];
	if (active) classNames.push(styles.tokenActive);
	if (dimmed) classNames.push(styles.tokenDimmed);

	return (
		<span
			className={classNames.join(" ")}
			style={color ? ({ "--chip-color": color } as CSSProperties) : undefined}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			{text}
		</span>
	);
}
