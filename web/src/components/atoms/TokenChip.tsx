import styles from "./TokenChip.module.css";

interface TokenChipProps {
	text: string;
	title?: string;
	active?: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

export function TokenChip({
	text,
	title,
	active = false,
	onMouseEnter,
	onMouseLeave,
}: Readonly<TokenChipProps>) {
	return (
		<span
			className={active ? `${styles.token} ${styles.tokenActive}` : styles.token}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			title={title}
		>
			{text}
		</span>
	);
}
