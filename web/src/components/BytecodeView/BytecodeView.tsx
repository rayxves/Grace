import { useEffect, useMemo, useRef, useState } from "react";
import { Binary, ChevronDown, ChevronUp } from "lucide-react";
import type { BytecodeInstruction, Step } from "../../types";
import { groupBytecodeByLine } from "../../lib/bytecode";
import { nodeAccentColor, nodeAccentFill } from "../../lib/nodeColor";
import { describeOpcodeText, stackEffectForOpcodeText } from "../../lib/instructions";
import { Panel } from "../Panel/Panel";
import { BytecodeRow } from "../atoms/BytecodeRow";
import { ConstantPoolView } from "../ConstantPoolView/ConstantPoolView";
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
	constants: string[];
	steps: Step[];
	stepIndex: number;
	errorOffset: number | null;
	hoveredNodeId: number | null;
	onHoverNode: (nodeId: number | null) => void;
	onSelectNode?: (nodeId: number | null) => void;
	currentOffset?: number | null;
	pendingOffsets?: ReadonlySet<number> | null;
	run: () => void;
	running: boolean;
}

export function BytecodeView({
	bytecode,
	constants,
	steps,
	stepIndex,
	errorOffset,
	hoveredNodeId,
	onHoverNode,
	onSelectNode,
	currentOffset,
	pendingOffsets = null,
	run,
	running,
}: Readonly<BytecodeViewProps>) {
	const currentRowRef = useRef<HTMLDivElement>(null);
	const [hoveredJumpTarget, setHoveredJumpTarget] = useState<number | null>(null);
	const [showConstants, setShowConstants] = useState(false);

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
			contentClassName={styles.panelBody}
			isEmpty={bytecode.length === 0}
			emptyIcon={<Binary size="1.5rem" />}
			placeholder="As instruções geradas aparecem aqui"
			emptyActionLabel="executar"
			onEmptyAction={run}
			emptyActionDisabled={running}
		>
			<div className={styles.scrollArea}>
			{groups.map((group) => (
				<div
					key={`${group.line}-${group.instructions[0].offset}`}
					className={styles.lineGroup}
				>
					<span className={styles.lineLabel}>linha {group.line}</span>
					<div className={styles.lineInstructions}>
						{group.instructions.map((instruction) => {
							const { nodeId } = instruction;
							const isCurrent = instruction.offset === highlightOffset;
							const isError = isCurrent && errorOffset !== null;
							const isExecuted =
								!isCurrent && executedOffsets.has(instruction.offset);
							const isHovered =
								!isCurrent && nodeId !== null && nodeId === hoveredNodeId;
							const isPending = pendingOffsets?.has(instruction.offset) ?? false;
							const isJumpTarget =
								!isCurrent && !isHovered && instruction.offset === hoveredJumpTarget;

							const accent = nodeAccentColor(nodeId);
							const accentFill = nodeAccentFill(nodeId);
							const jumpTarget = parseJumpTarget(instruction.text);
							const effect = stackEffectForOpcodeText(instruction.text);
							const description = describeOpcodeText(instruction.text);
							const tooltipLines = [description, effect?.note].filter(
								(line): line is string => Boolean(line),
							);

							return (
								<BytecodeRow
									key={instruction.offset}
									rowRef={isCurrent ? currentRowRef : undefined}
									instruction={instruction}
									stackDelta={effect ? formatStackDelta(effect.pops, effect.pushes) : undefined}
									tooltip={tooltipLines.length ? tooltipLines.join("\n") : undefined}
									accent={accent}
									accentFill={accentFill}
									isCurrent={isCurrent}
									isError={isError}
									isExecuted={isExecuted}
									isHovered={isHovered}
									isPending={isPending}
									isJumpTarget={isJumpTarget}
									onMouseEnter={() => {
										if (nodeId !== null) onHoverNode(nodeId);
										setHoveredJumpTarget(jumpTarget);
									}}
									onMouseLeave={() => {
										onHoverNode(null);
										setHoveredJumpTarget(null);
									}}
									onSelect={nodeId !== null ? () => onSelectNode?.(nodeId) : undefined}
								/>
							);
						})}
					</div>
				</div>
			))}
			</div>
			{constants.length > 0 && (
				<div className={styles.constantsSection}>
					<button
						type="button"
						className={styles.constantsToggle}
						onClick={() => setShowConstants((value) => !value)}
					>
						{showConstants ? <ChevronUp size="0.875rem" /> : <ChevronDown size="0.875rem" />}
						{showConstants ? "ocultar tabela de constantes" : "ver tabela de constantes"}
					</button>
					{showConstants && <ConstantPoolView constants={constants} />}
				</div>
			)}
		</Panel>
	);
}
