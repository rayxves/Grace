import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { BytecodeInstruction, Step } from "../../types";
import { groupBytecodeByLine } from "../../lib/bytecode";
import { nodeAccentColor, nodeAccentFill } from "../../lib/nodeColor";
import styles from "./BytecodeView.module.css";

interface BytecodeViewProps {
	bytecode: BytecodeInstruction[];
	steps: Step[];
	stepIndex: number;
	errorOffset: number | null;
	hoveredNodeId: number | null;
	onHoverNode: (nodeId: number | null) => void;
	currentOffset?: number | null;
	pendingOffsets?: ReadonlySet<number> | null;
}

export function BytecodeView({
	bytecode,
	steps,
	stepIndex,
	errorOffset,
	hoveredNodeId,
	onHoverNode,
	currentOffset,
	pendingOffsets = null,
}: Readonly<BytecodeViewProps>) {
	const currentRowRef = useRef<HTMLDivElement>(null);

	const resolvedCurrentOffset =
		currentOffset !== undefined ? currentOffset : (steps[stepIndex]?.offset ?? null);
	const highlightOffset = errorOffset ?? resolvedCurrentOffset;

	const executedOffsets = useMemo(() => {
		const offsets = new Set<number>();
		for (let i = 0; i <= stepIndex && i < steps.length; i++) {
			offsets.add(steps[i].offset);
		}
		return offsets;
	}, [steps, stepIndex]);

	const groups = useMemo(() => groupBytecodeByLine(bytecode), [bytecode]);

	useEffect(() => {
		currentRowRef.current?.scrollIntoView({
			block: "nearest",
			behavior: "smooth",
		});
	}, [highlightOffset]);

	return (
		<section className={styles.panel} data-role="bytecode-panel">
			<h2 className={styles.title}>bytecode</h2>
			{bytecode.length > 0 && (
				<p className={styles.caption}>
					a cor à esquerda de cada linha é a cor do nó da árvore que a gerou
				</p>
			)}
			<div className={styles.list}>
				{bytecode.length > 0 ? (
					groups.map((group) => (
						<div
							key={`${group.line}-${group.instructions[0].offset}`}
							className={styles.lineGroup}
						>
							<span className={styles.lineLabel}>linha {group.line}</span>
							<div className={styles.lineInstructions}>
								{group.instructions.map((instruction) => {
									const isCurrent = instruction.offset === highlightOffset;
									const isError = isCurrent && errorOffset !== null;
									const isExecuted =
										!isCurrent && executedOffsets.has(instruction.offset);
									const isHovered =
										!isCurrent &&
										instruction.nodeId !== null &&
										instruction.nodeId === hoveredNodeId;
									const isPending = pendingOffsets?.has(instruction.offset) ?? false;
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
									].join(" ");

									const accent = nodeAccentColor(instruction.nodeId);
									const accentFill = nodeAccentFill(instruction.nodeId);

									return (
										<div
											key={instruction.offset}
											ref={isCurrent ? currentRowRef : undefined}
											className={rowClass}
											data-offset={instruction.offset}
											style={
												accent
													? ({
															"--row-accent": accent,
															"--row-accent-fill": accentFill,
														} as CSSProperties)
													: undefined
											}
											onMouseEnter={() =>
												instruction.nodeId !== null &&
												onHoverNode(instruction.nodeId)
											}
											onMouseLeave={() => onHoverNode(null)}
										>
											<span className={styles.offset}>
												{String(instruction.offset).padStart(4, "0")}
											</span>
											<span className={styles.text}>{instruction.text}</span>
										</div>
									);
								})}
							</div>
						</div>
					))
				) : (
					<div className={styles.emptyState}>
						<p className={styles.placeholder}>
							execute um programa para ver o bytecode gerado
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
