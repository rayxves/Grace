import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Step, Trace } from "../../types";
import { revealedNodeIdsUpTo } from "../../lib/astReveal";
import { groupBytecodeByLine, type BytecodeLineGroup } from "../../lib/bytecode";
import { explainStep, collectOutput, describeOpcodeText, stackEffectForOpcodeText } from "../../lib/instructions";
import { nodeAccentColor, nodeAccentFill } from "../../lib/nodeColor";
import { buildScopeResolutionMap } from "../../lib/scopeLookup";
import { StackBlock } from "../../components/atoms/StackBlock";
import { BytecodeRow } from "../../components/atoms/BytecodeRow";
import { TokenChip } from "../../components/atoms/TokenChip";
import { FlightOverlay } from "../../components/FlightOverlay/FlightOverlay";
import { useFlight, moveDuration, type FlightTrigger } from "../../hooks/useFlight";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { ConstructionTree } from "./ConstructionTree";
import styles from "./Scene.module.css";

interface SceneProps {
	trace: Trace | null;
	step: Step | null;
	stepIndex: number;
	speed: number;
	error: string | null;
	hasBytecode: boolean;
}

const EMPTY_STEPS: Trace["steps"] = [];
const FLIGHT_GAP_MS = 500;
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
				{group.instructions.map((instruction) => {
					const effect = stackEffectForOpcodeText(instruction.text);
					const description = describeOpcodeText(instruction.text);
					const tooltipLines = [description, effect?.note].filter(
						(line): line is string => Boolean(line),
					);
					return (
						<BytecodeRow
							key={instruction.offset}
							instruction={instruction}
							accent={nodeAccentColor(instruction.nodeId)}
							accentFill={nodeAccentFill(instruction.nodeId)}
							isCurrent={instruction.offset === currentOffset}
							isExecuted={instruction.offset !== currentOffset && executedOffsets.has(instruction.offset)}
							tooltip={tooltipLines.length ? tooltipLines.join("\n") : undefined}
						/>
					);
				})}
			</div>
		</div>
	);
}

export function Scene({ trace, step, stepIndex, speed, error, hasBytecode }: Readonly<SceneProps>) {
	const reducedMotion = usePrefersReducedMotion();
	const mainAreaRef = useRef<HTMLDivElement>(null);
	const steps = trace?.steps ?? EMPTY_STEPS;
	const bytecode = trace?.bytecode ?? EMPTY_BYTECODE;
	const previousStep = stepIndex > 0 ? (steps[stepIndex - 1] ?? null) : null;

	const revealedNodeIds = useMemo(() => revealedNodeIdsUpTo(steps, stepIndex), [steps, stepIndex]);

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

	const revealedBytecode = useMemo(
		() => bytecode.filter((instruction) => executedOffsets.has(instruction.offset)),
		[bytecode, executedOffsets],
	);
	const groups = useMemo(() => groupBytecodeByLine(revealedBytecode), [revealedBytecode]);

	const currentLine = step?.line ?? null;
	const lineTokens = useMemo(() => {
		if (currentLine === null || !trace) return [];
		return trace.tokens.filter((token) => token.kind !== "EOF" && token.line === currentLine);
	}, [trace, currentLine]);

	const topFrame = step?.callStack.at(-1) ?? null;
	const isInFunction = (step?.callStack.length ?? 0) > 1 && topFrame !== null;
	const currentOffset = isInFunction ? null : (step?.offset ?? null);

	const output = useMemo(() => collectOutput(steps, stepIndex), [steps, stepIndex]);
	const explanation = step ? explainStep(step) : null;

	const nodeTrigger: FlightTrigger | null =
		step && currentOffset !== null && step.nodeId !== null
			? {
					key: `node-${stepIndex}`,
					fromSelector: `[data-node-id="${step.nodeId}"]`,
					toSelector: `[data-offset="${currentOffset}"]`,
					label: step.instruction,
					color: nodeAccentColor(step.nodeId),
				}
			: null;
	const nodeFlight = useFlight(mainAreaRef, nodeTrigger, speed);

	const previousStackSize = previousStep?.stack.length ?? 0;
	const currentStackSize = step?.stack.length ?? 0;

	const stackDelayMs = nodeTrigger ? moveDuration(speed) + FLIGHT_GAP_MS : 0;

	let stackTrigger: FlightTrigger | null = null;
	if (step && currentOffset !== null) {
		if (currentStackSize > previousStackSize && explanation?.pushed.length) {
			stackTrigger = {
				key: `push-${stepIndex}`,
				fromSelector: `[data-offset="${currentOffset}"]`,
				toSelector: "[data-stack-top]",
				label: `+ ${explanation.pushed[0]}`,
				color: nodeAccentColor(step.nodeId),
				delayMs: stackDelayMs,
			};
		} else if (currentStackSize < previousStackSize && explanation?.popped.length) {
			stackTrigger = {
				key: `pop-${stepIndex}`,
				fromSelector: "[data-stack-area]",
				toSelector: `[data-offset="${currentOffset}"]`,
				label: `− ${explanation.popped[0]}`,
				color: nodeAccentColor(step.nodeId),
				delayMs: stackDelayMs,
			};
		}
	}
	const stackFlight = useFlight(mainAreaRef, stackTrigger, speed);

	useEffect(() => {
		const top = mainAreaRef.current?.querySelector("[data-stack-top]");
		top?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [stepIndex]);

	useEffect(() => {
		if (currentOffset === null) return;
		const row = mainAreaRef.current?.querySelector(`[data-offset="${currentOffset}"]`);
		row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [currentOffset]);

	return (
		<div className={styles.scene}>
			<div className={styles.tokensRow}>
				{lineTokens.length === 0 && (
					<p className={styles.tokensEmpty}>Execute um programa para ver os tokens da linha atual</p>
				)}
				{lineTokens.map((token, i) => (
					<TokenChip key={`${i}-${token.line}-${token.text}`} text={token.text || token.kind} />
				))}
			</div>

			<div className={styles.mainArea} ref={mainAreaRef}>
				<FlightOverlay flight={nodeFlight} />
				<FlightOverlay flight={stackFlight} />
				<div className={styles.treeZone}>
					<ConstructionTree
						ast={trace?.ast ?? null}
						revealedNodeIds={revealedNodeIds}
						currentNodeId={step?.nodeId ?? null}
						resolvedDepthByNode={resolvedDepthByNode}
					/>
					<AnimatePresence initial={false}>
						{isInFunction && (
							<motion.div
								key="frame-badge"
								className={styles.frameBadge}
								initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
								transition={{ duration: reducedMotion ? 0 : 0.18 }}
							>
								dentro de {topFrame?.functionName}()
							</motion.div>
						)}
					</AnimatePresence>
				</div>
				<div className={styles.rightColumn}>
					<div className={styles.bytecodeZone}>
						<span className={styles.bytecodeTitle}>bytecode</span>
						<div className={styles.bytecodeList}>
							{groups.map((group) => renderGroup(group, currentOffset, executedOffsets))}
						</div>
					</div>
					<div className={styles.stackZone}>
						<span className={styles.stackTitle}>pilha de execução</span>
						<div className={styles.stack} data-stack-area>
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
							{error && (
								<span className={styles.outputError} role="alert">
									{(() => {
										if (step) return "A execução parou aqui: ";
										if (hasBytecode) return "A execução falhou logo na primeira instrução: ";
										return "o programa não chegou a ser compilado: ";
									})()}
									{error}
								</span>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
