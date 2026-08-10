import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Toolbar } from "../../components/Toolbar/Toolbar";
import { CodeEditor } from "../../components/CodeEditor/CodeEditor";
import { AstView } from "../../components/AstView/AstView";
import { BytecodeView } from "../../components/BytecodeView/BytecodeView";
import { TokensView } from "../../components/TokensView/TokensView";
import { isPhase, type Phase } from "../../lib/phase";
import { ExecutionStatePanel } from "../../components/ExecutionStatePanel/ExecutionStatePanel";
import { usePlayer } from "../../hooks/usePlayer";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useHighlightState } from "../../hooks/useHighlightState";
import { useRoute } from "../../hooks/useRoute";
import { collectOutput } from "../../lib/instructions";
import { parseErrorLine } from "../../lib/errors";
import { nodeAccentColor } from "../../lib/nodeColor";
import { buildAstNodeIndex } from "../../lib/astIndex";
import { buildScopeResolutionMap } from "../../lib/scopeLookup";
import { countAstNodesByLine, countBytecodeByLine } from "../../lib/expansionStats";
import type { Trace } from "../../types";
import type { Mode } from "../Visualizer";
import styles from "./FullMode.module.css";

const EMPTY_STEPS: Trace["steps"] = [];
const EMPTY_BYTECODE: Trace["bytecode"] = [];

interface FullModeProps {
	trace: Trace | null;
	running: boolean;
	runtimeError: string | null;
	run: () => void;
	appMode: Mode;
	onSelectAppMode: (mode: Mode) => void;
}

export function FullMode({
	trace,
	running,
	runtimeError,
	run,
	appMode,
	onSelectAppMode,
}: Readonly<FullModeProps>) {
	const { program, setProgram, route, navigate } = useRoute();
	const phase: Phase = isPhase(route.param) ? route.param : "tokens";
	const workspaceRef = useRef<HTMLElement>(null);
	useEffect(() => {
		if (workspaceRef.current) workspaceRef.current.scrollTop = 0;
	}, [phase]);
	const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
	const [pinnedNodeId, setPinnedNodeId] = useState<number | null>(null);
	const [hoveredTokenLine, setHoveredTokenLine] = useState<number | null>(null);

	const togglePinnedNode = useCallback((nodeId: number | null) => {
		if (nodeId === null) {
			setPinnedNodeId(null);
			return;
		}
		setPinnedNodeId((prev) => (prev === nodeId ? null : nodeId));
	}, []);

	const effectiveNodeId = pinnedNodeId ?? hoveredNodeId;

	const steps = trace?.steps ?? EMPTY_STEPS;
	const bytecode = trace?.bytecode ?? EMPTY_BYTECODE;
	const player = usePlayer(steps, (step) => step.line);

	const handleRun = useCallback(() => {
		setPinnedNodeId(null);
		run();
	}, [run]);

	const hasTrace = trace !== null && steps.length > 0;
	const errorMessage = runtimeError ?? trace?.error ?? null;
	const errorLine = useMemo(() => parseErrorLine(errorMessage), [errorMessage]);

	const atLastStep = hasTrace && player.index >= player.total - 1;
	const errorReached = errorMessage !== null && (!hasTrace || atLastStep);

	const {
		gatedCurrentLine,
		gatedCurrentNodeId,
		gatedErrorLine,
		gatedErrorOffset,
		gatedErrorNodeId,
		hoverLine,
	} = useHighlightState({
		hasTrace,
		errorReached,
		currentStep: player.currentStep,
		errorLine,
		errorOffset: trace?.errorOffset ?? null,
		bytecode,
		hoveredNodeId: effectiveNodeId,
	});

	const output = useMemo(
		() => (hasTrace ? collectOutput(steps, player.index) : []),
		[hasTrace, steps, player.index],
	);

	const previousStep =
		hasTrace && player.index > 0 ? steps[player.index - 1] : null;

	const astIndex = useMemo(() => buildAstNodeIndex(trace?.ast ?? null), [trace]);
	const resolveMap = useMemo(
		() => buildScopeResolutionMap(trace?.resolveSteps ?? []),
		[trace],
	);
	const astCountsByLine = useMemo(() => countAstNodesByLine(trace?.ast ?? null), [trace]);
	const bytecodeCountsByLine = useMemo(() => countBytecodeByLine(bytecode), [bytecode]);

	const selectPhase = useCallback(
		(next: Phase) => {
			navigate("visualizer", next);
		},
		[navigate],
	);

	const effectiveHoverLine = hoveredTokenLine ?? hoverLine;
	const effectiveHoverColor = hoveredTokenLine !== null ? undefined : nodeAccentColor(effectiveNodeId);

	useKeyboardShortcuts({
		enabled: hasTrace,
		onNext: player.next,
		onPrevious: player.previous,
		onTogglePlay: player.togglePlay,
		onReset: player.reset,
	});

	const pinnedNode = pinnedNodeId !== null ? (astIndex.get(pinnedNodeId) ?? null) : null;

	let structureContent: ReactNode;
	if (phase === "tokens") {
		structureContent = (
			<TokensView
				tokens={trace?.tokens ?? []}
				hoveredLine={effectiveHoverLine}
				onHoverLine={setHoveredTokenLine}
				run={handleRun}
				running={running}
			/>
		);
	} else if (phase === "arvore") {
		structureContent = (
			<AstView
				ast={trace?.ast ?? null}
				steps={steps}
				stepIndex={player.index}
				currentNodeId={gatedCurrentNodeId}
				errorNodeId={gatedErrorNodeId}
				errorLine={gatedErrorLine}
				hoveredNodeId={effectiveNodeId}
				onHoverNode={setHoveredNodeId}
				onSelectNode={togglePinnedNode}
				pinnedNode={pinnedNode}
				resolveMap={resolveMap}
				astCountsByLine={astCountsByLine}
				bytecodeCountsByLine={bytecodeCountsByLine}
				run={handleRun}
				running={running}
			/>
		);
	} else {
		structureContent = (
			<BytecodeView
				bytecode={bytecode}
				constants={trace?.constants ?? []}
				steps={steps}
				stepIndex={player.index}
				errorOffset={gatedErrorOffset}
				hoveredNodeId={effectiveNodeId}
				onHoverNode={setHoveredNodeId}
				onSelectNode={togglePinnedNode}
				run={handleRun}
				running={running}
			/>
		);
	}

	return (
		<div className={styles.app}>
			<Toolbar
				onRun={handleRun}
				running={running}
				hasTrace={hasTrace}
				playing={player.playing}
				speed={player.speed}
				stepIndex={player.index}
				totalSteps={player.total}
				onTogglePlay={player.togglePlay}
				onPrevious={player.previous}
				onNext={player.next}
				onNextLine={player.nextLine}
				onReset={player.reset}
				onSpeedChange={player.setSpeed}
				phase={phase}
				onSelectPhase={selectPhase}
				appMode={appMode}
				onSelectAppMode={onSelectAppMode}
			/>

			<main ref={workspaceRef} className={styles.workspace}>
				<div className={styles.editorColumn}>
					<CodeEditor
						value={program}
						onChange={setProgram}
						currentLine={gatedCurrentLine}
						errorLine={gatedErrorLine}
						hoverLine={effectiveHoverLine}
						hoverColor={effectiveHoverColor}
					/>
				</div>
				<div className={styles.visualColumn}>
					<div className={styles.structurePanel}>
						{structureContent}
					</div>
					{phase !== "tokens" && (
						<div className={styles.bottomRow}>
							<ExecutionStatePanel
								step={hasTrace ? player.currentStep : null}
								previousStep={previousStep}
								output={output}
								error={errorReached ? errorMessage : null}
								hasBytecode={(trace?.bytecode.length ?? 0) > 0}
								run={handleRun}
								running={running}
							/>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
