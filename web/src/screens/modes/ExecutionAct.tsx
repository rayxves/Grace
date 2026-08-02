import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Step, Trace } from "../../types";
import { computeCompileProgress } from "../../lib/compileProgress";
import { groupBytecodeByLine, type BytecodeLineGroup } from "../../lib/bytecode";
import { explainStep } from "../../lib/instructions";
import { collectOutput } from "../../lib/instructions";
import { nodeAccentColor, nodeAccentFill } from "../../lib/nodeColor";
import { buildScopeResolutionMap } from "../../lib/scopeLookup";
import { findFunctionNode, functionBytecodeRange } from "../../lib/callFrames";
import { StackBlock } from "../../components/atoms/StackBlock";
import { BytecodeRow } from "../../components/atoms/BytecodeRow";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { ConstructionTree } from "./ConstructionTree";
import styles from "./ExecutionAct.module.css";

interface ExecutionActProps {
	trace: Trace | null;
	step: Step | null;
	stepIndex: number;
}

const EMPTY_STEPS: Trace["steps"] = [];
const EMPTY_BYTECODE: Trace["bytecode"] = [];

function renderGroup(
	group: BytecodeLineGroup,
	currentOffset: number | null,
	executedOffsets: ReadonlySet<number>,
) {
	return (
		<div key={`${group.line}-${group.instructions[0].offset}`} className={styles.lineGroup}>
			<span className={styles.lineLabel}>linha {group.line}</span>
			<div className={styles.lineInstructions}>
				{group.instructions.map((instruction) => (
					<BytecodeRow
						key={instruction.offset}
						instruction={instruction}
						accent={nodeAccentColor(instruction.nodeId)}
						accentFill={nodeAccentFill(instruction.nodeId)}
						isCurrent={instruction.offset === currentOffset}
						isExecuted={instruction.offset !== currentOffset && executedOffsets.has(instruction.offset)}
					/>
				))}
			</div>
		</div>
	);
}

export function ExecutionAct({ trace, step, stepIndex }: Readonly<ExecutionActProps>) {
	const reducedMotion = usePrefersReducedMotion();
	const steps = trace?.steps ?? EMPTY_STEPS;
	const bytecode = trace?.bytecode ?? EMPTY_BYTECODE;

	const fullReveal = useMemo(
		() => computeCompileProgress(trace?.compileSteps ?? [], (trace?.compileSteps.length ?? 1) - 1),
		[trace],
	);

	const resolveMap = useMemo(() => buildScopeResolutionMap(trace?.resolveSteps ?? []), [trace]);
	const resolvedDepthByNode = useMemo(() => {
		const map = new Map<number, number>();
		for (const [nodeId, resolution] of resolveMap) map.set(nodeId, resolution.depth);
		return map;
	}, [resolveMap]);

	const executedOffsets = useMemo(() => {
		const offsets = new Set<number>();
		for (let i = 0; i <= stepIndex && i < steps.length; i++) offsets.add(steps[i].offset);
		return offsets;
	}, [steps, stepIndex]);

	const groups = useMemo(() => groupBytecodeByLine(bytecode), [bytecode]);

	const topFrame = step?.callStack.at(-1) ?? null;
	const isInFunction = (step?.callStack.length ?? 0) > 1 && topFrame !== null;
	const frameRange = useMemo(() => {
		if (!isInFunction || !topFrame || !trace?.ast) return null;
		const functionNode = findFunctionNode(trace.ast, topFrame.functionName);
		if (!functionNode) return null;
		return functionBytecodeRange(functionNode, bytecode);
	}, [isInFunction, topFrame, trace, bytecode]);

	const beforeGroups = frameRange ? groups.filter((g) => g.instructions[0].offset < frameRange.min) : groups;
	const frameGroups = frameRange
		? groups.filter(
				(g) => g.instructions[0].offset >= frameRange.min && g.instructions[0].offset <= frameRange.max,
			)
		: [];
	const afterGroups = frameRange ? groups.filter((g) => g.instructions[0].offset > frameRange.max) : [];

	const output = useMemo(() => collectOutput(steps, stepIndex), [steps, stepIndex]);
	const explanation = step ? explainStep(step) : null;

	return (
		<div className={styles.scene}>
			<div className={styles.mainArea}>
				<div className={styles.treeZone}>
					<ConstructionTree
						ast={trace?.ast ?? null}
						revealedNodeIds={fullReveal.revealedNodeIds}
						currentNodeId={step?.nodeId ?? null}
						resolvedDepthByNode={resolvedDepthByNode}
					/>
				</div>
				<div className={styles.rightColumn}>
					<div className={styles.bytecodeZone}>
						<span className={styles.bytecodeTitle}>bytecode</span>
						<div className={styles.bytecodeList}>
							{beforeGroups.map((group) => renderGroup(group, step?.offset ?? null, executedOffsets))}
							<AnimatePresence initial={false}>
								{frameGroups.length > 0 && (
									<motion.div
										key="frame-band"
										className={styles.frameBand}
										initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }}
										transition={{ duration: reducedMotion ? 0 : 0.18 }}
									>
										<span className={styles.frameLabel}>
											dentro de {topFrame?.functionName}()
										</span>
										{frameGroups.map((group) => renderGroup(group, step?.offset ?? null, executedOffsets))}
									</motion.div>
								)}
							</AnimatePresence>
							{afterGroups.map((group) => renderGroup(group, step?.offset ?? null, executedOffsets))}
						</div>
					</div>
					<div className={styles.stackZone}>
						<span className={styles.stackTitle}>pilha de execução</span>
						<div className={styles.stack}>
							<AnimatePresence initial={false}>
								{(step?.stack ?? []).map((value, i, all) => (
									<StackBlock key={`${i}-${value}`} value={value} isTop={i === all.length - 1} />
								))}
							</AnimatePresence>
							{(!step || step.stack.length === 0) && <p className={styles.stackEmpty}>pilha vazia</p>}
						</div>
						<div className={styles.output}>
							{output.map((line, i) => (
								<span key={`${i}-${line}`} className={styles.outputLine}>
									{line}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className={styles.narration}>
				<p className={styles.narrationText}>
					{explanation?.summary || "Avance um passo para acompanhar a execução"}
				</p>
			</div>
		</div>
	);
}
