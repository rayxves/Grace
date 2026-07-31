import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { BytecodeInstruction, Step } from "../../types";
import { groupBytecodeByLine } from "../../lib/bytecode";
import { nodeAccentColor, nodeAccentFill } from "../../lib/nodeColor";
import { describeOpcodeText, stackEffectForOpcodeText } from "../../lib/instructions";
import { Panel } from "../Panel/Panel";
import styles from "./BytecodeView.module.css";

function parseJumpTarget(text: string): number | null {
	const match = /para o byte (\d+)/.exec(text);
	return match ? Number(match[1]) : null;
}

function formatStackDelta(pops: number | "variável", pushes: number | "variável"): string {
	if (pops === "variável" || pushes === "variável") return "var";
	const delta = pushes - pops;
	if (delta > 0) return `+${delta}`;
	if (delta < 0) return `${delta}`;
	return "±0";
}

interface BytecodeViewProps {
	bytecode: BytecodeInstruction[];
	steps: Step[];
	stepIndex: number;
	errorOffset: number | null;
	hoveredNodeId: number | null;
	onHoverNode: (nodeId: number | null) => void;
	onSelectNode?: (nodeId: number | null) => void;
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
	onSelectNode,
	currentOffset,
	pendingOffsets = null,
}: Readonly<BytecodeViewProps>) {
	const currentRowRef = useRef<HTMLDivElement>(null);
	const [hoveredJumpTarget, setHoveredJumpTarget] = useState<number | null>(null);

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

	const previousHighlightOffset = useRef<number | null>(null);
	useEffect(() => {
		const previous = previousHighlightOffset.current;
		previousHighlightOffset.current = highlightOffset;
		if (previous === null) return;
		currentRowRef.current?.scrollIntoView({
			block: "nearest",
			behavior: "smooth",
		});
	}, [highlightOffset]);

	return (
		<Panel
			title="bytecode"
			dataRole="bytecode-panel"
			titleClassName={styles.title}
			caption={
				bytecode.length > 0
					? "A cor à esquerda de cada linha é a cor do nó da árvore que a gerou"
					: undefined
			}
			contentClassName={styles.list}
			isEmpty={bytecode.length === 0}
			emptyClassName={styles.emptyState}
			placeholder="Execute um programa para ver o bytecode gerado"
			placeholderClassName={styles.placeholder}
		>
			{groups.map((group) => (
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
							const isJumpTarget =
								!isCurrent && !isHovered && instruction.offset === hoveredJumpTarget;
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

							const accent = nodeAccentColor(instruction.nodeId);
							const accentFill = nodeAccentFill(instruction.nodeId);
							const isSelectable = instruction.nodeId !== null;
							const selectThisRow = () =>
								instruction.nodeId !== null && onSelectNode?.(instruction.nodeId);
							const jumpTarget = parseJumpTarget(instruction.text);
							const effect = stackEffectForOpcodeText(instruction.text);
							const description = describeOpcodeText(instruction.text);
							const tooltipLines = [description, effect?.note].filter(
								(line): line is string => Boolean(line),
							);

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
									onMouseEnter={() => {
										if (instruction.nodeId !== null) onHoverNode(instruction.nodeId);
										setHoveredJumpTarget(jumpTarget);
									}}
									onMouseLeave={() => {
										onHoverNode(null);
										setHoveredJumpTarget(null);
									}}
									onClick={isSelectable ? selectThisRow : undefined}
									onKeyDown={(event) => {
										if (!isSelectable) return;
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											selectThisRow();
										}
									}}
									role={isSelectable ? "button" : undefined}
									tabIndex={isSelectable ? 0 : undefined}
									title={tooltipLines.length ? tooltipLines.join("\n") : undefined}
								>
									<span className={styles.offset}>
										{String(instruction.offset).padStart(4, "0")}
									</span>
									<span className={styles.text}>{instruction.text}</span>
									{effect && (
										<span className={styles.stackDelta}>
											{formatStackDelta(effect.pops, effect.pushes)}
										</span>
									)}
								</div>
							);
						})}
					</div>
				</div>
			))}
		</Panel>
	);
}
