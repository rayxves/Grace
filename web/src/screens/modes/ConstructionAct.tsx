import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Trace } from "../../types";
import type { Beat } from "../../lib/beats";
import { compileStepIndexAt } from "../../lib/beats";
import { explainBeat } from "../../lib/beatNarration";
import { buildAstNodeIndex } from "../../lib/astIndex";
import { countEmitsByNode } from "../../lib/compileNarration";
import { computeCompileProgress, growBytecodeUpTo } from "../../lib/compileProgress";
import { nodeAccentColor, nodeAccentFill } from "../../lib/nodeColor";
import { TokenChip } from "../../components/atoms/TokenChip";
import { BytecodeRow } from "../../components/atoms/BytecodeRow";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { ConstructionTree } from "./ConstructionTree";
import styles from "./ConstructionAct.module.css";

interface ConstructionActProps {
	trace: Trace | null;
	beats: Beat[];
	beatIndex: number;
}

const PHASE_LABELS: Record<Beat["phase"], string> = {
	scan: "separando token",
	parse: "montando o nó",
	resolve: "resolvendo escopo",
	compile: "emitindo instrução",
};

export function ConstructionAct({ trace, beats, beatIndex }: Readonly<ConstructionActProps>) {
	const reducedMotion = usePrefersReducedMotion();
	const currentBeat = beats[beatIndex] ?? null;
	const currentLine = currentBeat?.line ?? null;

	const astIndex = useMemo(() => buildAstNodeIndex(trace?.ast ?? null), [trace]);
	const emitCountByNode = useMemo(
		() => countEmitsByNode(trace?.compileSteps ?? []),
		[trace],
	);

	const compileStepIndex = useMemo(
		() => compileStepIndexAt(beats, beatIndex),
		[beats, beatIndex],
	);

	const compileProgress = useMemo(
		() => computeCompileProgress(trace?.compileSteps ?? [], compileStepIndex),
		[trace, compileStepIndex],
	);

	const grownBytecode = useMemo(
		() => growBytecodeUpTo(trace?.bytecode ?? [], trace?.compileSteps ?? [], compileStepIndex),
		[trace, compileStepIndex],
	);

	const resolvedDepthByNode = useMemo(() => {
		const map = new Map<number, number>();
		for (let i = 0; i <= beatIndex && i < beats.length; i++) {
			const beat = beats[i];
			if (beat.phase === "resolve") map.set(beat.nodeId, beat.scopeDepth);
		}
		return map;
	}, [beats, beatIndex]);

	const lineTokens = useMemo(() => {
		if (currentLine === null) return [];
		const found: Extract<Beat, { phase: "scan" }>[] = [];
		for (let i = 0; i <= beatIndex && i < beats.length; i++) {
			const beat = beats[i];
			if (beat.phase === "scan" && beat.line === currentLine) found.push(beat);
		}
		return found;
	}, [beats, beatIndex, currentLine]);

	const currentCompileOffset = currentBeat?.phase === "compile" ? currentBeat.offset : null;

	const explanation = currentBeat ? explainBeat(currentBeat, astIndex, emitCountByNode) : null;
	const narrationAccent =
		currentBeat && (currentBeat.phase === "parse" || currentBeat.phase === "resolve" || currentBeat.phase === "compile")
			? nodeAccentColor(currentBeat.nodeId)
			: undefined;

	return (
		<div className={styles.scene}>
			<div className={styles.tokensRow}>
				{lineTokens.length === 0 && (
					<p className={styles.tokensEmpty}>Execute um programa para ver a construção passo a passo</p>
				)}
				<AnimatePresence initial={false}>
					{lineTokens.map((beat, i) => (
						<motion.span
							key={`${beat.line}-${i}-${beat.text}`}
							initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: reducedMotion ? 0 : 0.18 }}
						>
							<TokenChip text={beat.text} active={beat === currentBeat} />
						</motion.span>
					))}
				</AnimatePresence>
			</div>

			<div className={styles.mainArea}>
				<ConstructionTree
					ast={trace?.ast ?? null}
					revealedNodeIds={compileProgress.revealedNodeIds}
					currentNodeId={compileProgress.currentNodeId}
					resolvedDepthByNode={resolvedDepthByNode}
				/>

				<div className={styles.bytecodeColumn}>
					<span className={styles.bytecodeTitle}>bytecode</span>
					<div className={styles.bytecodeList}>
						{grownBytecode.length === 0 && (
							<p className={styles.bytecodeEmpty}>Ainda não há bytecode gerado</p>
						)}
						<AnimatePresence initial={false}>
							{grownBytecode.map((instruction) => (
								<motion.div
									key={instruction.offset}
									initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: reducedMotion ? 0 : 0.18 }}
								>
									<BytecodeRow
										instruction={instruction}
										accent={nodeAccentColor(instruction.nodeId)}
										accentFill={nodeAccentFill(instruction.nodeId)}
										isCurrent={instruction.offset === currentCompileOffset}
										isPending={instruction.pending}
									/>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				</div>
			</div>

			<div className={styles.narration}>
				{currentBeat && (
					<span
						className={styles.narrationBadge}
						style={narrationAccent ? { borderColor: narrationAccent, color: narrationAccent } : undefined}
					>
						{PHASE_LABELS[currentBeat.phase]}
					</span>
				)}
				<p className={styles.narrationText}>
					{explanation?.summary || "Avance um passo para acompanhar o compilador construindo o programa"}
				</p>
			</div>
		</div>
	);
}
