import type { CSSProperties, Ref } from "react";
import type { BytecodeInstruction } from "../../types";
import styles from "./BytecodeRow.module.css";

interface BytecodeRowProps {
	instruction: BytecodeInstruction;
	stackDelta?: string;
	tooltip?: string;
	accent?: string;
	accentFill?: string;
	isCurrent?: boolean;
	isError?: boolean;
	isExecuted?: boolean;
	isHovered?: boolean;
	isPending?: boolean;
	isJumpTarget?: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	onSelect?: () => void;
	rowRef?: Ref<HTMLDivElement>;
}

export function BytecodeRow({
	instruction,
	stackDelta,
	tooltip,
	accent,
	accentFill,
	isCurrent = false,
	isError = false,
	isExecuted = false,
	isHovered = false,
	isPending = false,
	isJumpTarget = false,
	onMouseEnter,
	onMouseLeave,
	onSelect,
	rowRef,
}: Readonly<BytecodeRowProps>) {
	let highlightClass = "";
	if (isError) {
		highlightClass = styles.rowError;
	} else if (isCurrent) {
		highlightClass = styles.rowCurrent;
	}
	const rowClass = [
		styles.row,
		highlightClass,
		isExecuted ? styles.rowExecuted : "",
		isHovered ? styles.rowHovered : "",
		isPending ? styles.rowPending : "",
		isJumpTarget ? styles.rowJumpTarget : "",
	].join(" ");
	const isSelectable = Boolean(onSelect);

	return (
		<div
			ref={rowRef}
			className={rowClass}
			data-offset={instruction.offset}
			style={
				accent
					? ({ "--row-accent": accent, "--row-accent-fill": accentFill } as CSSProperties)
					: undefined
			}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onClick={isSelectable ? onSelect : undefined}
			onKeyDown={(event) => {
				if (!isSelectable) return;
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onSelect?.();
				}
			}}
			role={isSelectable ? "button" : undefined}
			tabIndex={isSelectable ? 0 : undefined}
			title={tooltip}
		>
			<span className={styles.offset}>
				{String(instruction.offset).padStart(4, "0")}
			</span>
			<span className={styles.text}>{instruction.text}</span>
			{stackDelta && <span className={styles.stackDelta}>{stackDelta}</span>}
		</div>
	);
}
