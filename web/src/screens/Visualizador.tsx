import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Binary } from "lucide-react";
import { Toolbar } from "../components/Toolbar/Toolbar";
import { CodeEditor } from "../components/CodeEditor/CodeEditor";
import { AstView } from "../components/AstView/AstView";
import { BytecodeView } from "../components/BytecodeView/BytecodeView";
import { TokensView } from "../components/TokensView/TokensView";
import { isPhase, type Phase } from "../components/PipelineStrip/PipelineStrip";
import { StackView } from "../components/StackView/StackView";
import { VariablesView } from "../components/VariablesView/VariablesView";
import { AstNodeInspector } from "../components/AstNodeInspector/AstNodeInspector";
import { AstNodeInsights } from "../components/AstNodeInsights/AstNodeInsights";
import { ConstantPoolView } from "../components/ConstantPoolView/ConstantPoolView";
import type { ScrubberMarker } from "../components/Scrubber/Scrubber";
import { CompileChipLayer } from "../components/CompileChipLayer/CompileChipLayer";
import { CompileNarration } from "../components/CompileNarration/CompileNarration";
import { usePlayer } from "../hooks/usePlayer";
import { useTheme } from "../hooks/useTheme";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useHighlightState } from "../hooks/useHighlightState";
import { useCompileFlight } from "../hooks/useCompileFlight";
import { useRoute } from "../hooks/useRoute";
import { runGrace } from "../lib/grace";
import { collectOutput } from "../lib/instructions";
import { parseErrorLine } from "../lib/errors";
import { computeCompileProgress, growBytecodeUpTo } from "../lib/compileProgress";
import { nodeAccentColor } from "../lib/nodeColor";
import { buildAstNodeIndex } from "../lib/astIndex";
import { buildScopeResolutionMap } from "../lib/scopeLookup";
import { countAstNodesByLine, countBytecodeByLine, maxStackDepth } from "../lib/expansionStats";
import { countEmitsByNode } from "../lib/compileNarration";
import type { Trace } from "../types";
import styles from "./Visualizador.module.css";

const EMPTY_STEPS: Trace["steps"] = [];
const EMPTY_BYTECODE: Trace["bytecode"] = [];
const EMPTY_COMPILE_STEPS: Trace["compileSteps"] = [];

interface PlayerControls {
	index: number;
	total: number;
	playing: boolean;
	speed: number;
	next: () => void;
	previous: () => void;
	togglePlay: () => void;
	nextLine: () => void;
	reset: () => void;
	goTo: (index: number) => void;
	setSpeed: (speed: number) => void;
}

export function Visualizador() {
	const { program, setProgram, route, navigate } = useRoute();
	const { theme, toggleTheme } = useTheme();
	const [trace, setTrace] = useState<Trace | null>(null);
	const [running, setRunning] = useState(false);
	const [runtimeError, setRuntimeError] = useState<string | null>(null);
	const phase: Phase = isPhase(route.param) ? route.param : "bytecode";
	const workspaceRef = useRef<HTMLElement>(null);
	useEffect(() => {
		if (workspaceRef.current) workspaceRef.current.scrollTop = 0;
	}, [phase]);
	const [compileMode, setCompileMode] = useState(false);
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
	const compileSteps = trace?.compileSteps ?? EMPTY_COMPILE_STEPS;
	const player = usePlayer(steps, (step) => step.line);
	const compilePlayer = usePlayer(compileSteps, () => null);

	const run = useCallback(async () => {
		setRunning(true);
		setRuntimeError(null);
		setPinnedNodeId(null);
		try {
			const result = await runGrace(program);
			setTrace(result);
		} catch (error) {
			setTrace(null);
			setRuntimeError(error instanceof Error ? error.message : String(error));
		} finally {
			setRunning(false);
		}
	}, [program]);

	const hasTrace = trace !== null && steps.length > 0;
	const hasCompileTrace = trace !== null && compileSteps.length > 0;
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

	const compileProgress = useMemo(
		() => computeCompileProgress(compileSteps, compilePlayer.index),
		[compileSteps, compilePlayer.index],
	);

	const grownBytecode = useMemo(
		() => growBytecodeUpTo(bytecode, compileSteps, compilePlayer.index),
		[bytecode, compileSteps, compilePlayer.index],
	);

	const pendingOffsets = useMemo(
		() => new Set(grownBytecode.filter((instr) => instr.pending).map((instr) => instr.offset)),
		[grownBytecode],
	);

	const compileFlight = useCompileFlight(compileMode, compilePlayer.index, compileSteps);

	const astIndex = useMemo(() => buildAstNodeIndex(trace?.ast ?? null), [trace]);
	const emitCountByNode = useMemo(() => countEmitsByNode(compileSteps), [compileSteps]);
	const resolveMap = useMemo(
		() => buildScopeResolutionMap(trace?.resolveSteps ?? []),
		[trace],
	);
	const astCountsByLine = useMemo(() => countAstNodesByLine(trace?.ast ?? null), [trace]);
	const bytecodeCountsByLine = useMemo(() => countBytecodeByLine(bytecode), [bytecode]);
	const maxStackUsage = useMemo(() => maxStackDepth(steps), [steps]);

	const compileCurrentStep = compilePlayer.currentStep;
	const compileCurrentOffset =
		compileCurrentStep?.kind === "emit"
			? compileCurrentStep.offset
			: (grownBytecode.at(-1)?.offset ?? null);
	const compileCurrentLine =
		compileCurrentStep?.kind === "enter" || compileCurrentStep?.kind === "emit"
			? compileCurrentStep.line
			: null;

	const selectPhase = useCallback(
		(next: Phase) => {
			if (next === "codigo" || next === "tokens") {
				setCompileMode(false);
			}
			navigate("visualizador", next);
		},
		[navigate],
	);

	const toggleCompileMode = useCallback(() => {
		const next = !compileMode;
		setCompileMode(next);
		if (next && (phase === "codigo" || phase === "tokens")) {
			navigate("visualizador", "execucao");
		}
	}, [compileMode, phase, navigate]);

	const activeMode: "execution" | "compilation" = compileMode ? "compilation" : "execution";
	const activePlayer: PlayerControls = compileMode ? compilePlayer : player;
	const activeHasTrace = compileMode ? hasCompileTrace : hasTrace;
	const activeCurrentLine = compileMode ? compileCurrentLine : gatedCurrentLine;
	const effectiveHoverLine = hoveredTokenLine ?? hoverLine;
	const effectiveHoverColor = hoveredTokenLine !== null ? undefined : nodeAccentColor(effectiveNodeId);

	useKeyboardShortcuts({
		enabled: activeHasTrace,
		onNext: activePlayer.next,
		onPrevious: activePlayer.previous,
		onTogglePlay: activePlayer.togglePlay,
		onReset: activePlayer.reset,
	});

	const executionMarkers = useMemo<ScrubberMarker[]>(() => {
		const found: ScrubberMarker[] = [];
		steps.forEach((step, i) => {
			if (step.instruction === "imprime") {
				found.push({ index: i, kind: "print", title: `passo ${i + 1}: imprime` });
			} else if (step.instruction === "volta (laço)") {
				found.push({ index: i, kind: "loop", title: `passo ${i + 1}: volta do laço` });
			}
		});
		return found;
	}, [steps]);

	const astViewProps = {
		ast: trace?.ast ?? null,
		steps,
		stepIndex: player.index,
		currentNodeId: gatedCurrentNodeId,
		errorNodeId: gatedErrorNodeId,
		errorLine: gatedErrorLine,
		hoveredNodeId: effectiveNodeId,
		onHoverNode: setHoveredNodeId,
		onSelectNode: togglePinnedNode,
	};

	const bytecodeViewProps = {
		bytecode,
		steps,
		stepIndex: player.index,
		errorOffset: gatedErrorOffset,
		hoveredNodeId: effectiveNodeId,
		onHoverNode: setHoveredNodeId,
		onSelectNode: togglePinnedNode,
	};

	const inspectedNodeId = pinnedNodeId ?? hoveredNodeId ?? gatedCurrentNodeId;
	const inspectedNode = inspectedNodeId !== null ? (astIndex.get(inspectedNodeId) ?? null) : null;
	let inspectedStatusLabel = "passo atual";
	if (pinnedNodeId !== null) {
		inspectedStatusLabel = "fixado";
	} else if (hoveredNodeId !== null) {
		inspectedStatusLabel = "em foco";
	}

	const compileToggleClassName = compileMode
		? `${styles.modeToggle} ${styles.modeToggleActive}`
		: styles.modeToggle;

	let structureContent: ReactNode;
	if (phase === "codigo") {
		structureContent = (
			<div className={styles.codePhaseNotice}>
				<p>
					O código-fonte é o ponto de partida de todo o resto. Passe o mouse
					pelas outras fases para ver a correspondência com cada linha aqui.
				</p>
			</div>
		);
	} else if (phase === "tokens") {
		structureContent = (
			<TokensView
				tokens={trace?.tokens ?? []}
				hoveredLine={effectiveHoverLine}
				onHoverLine={setHoveredTokenLine}
			/>
		);
	} else {
		const showTree = phase === "arvore" || phase === "execucao";
		const showBytecode = phase === "bytecode" || phase === "execucao";
		const showBoth = showTree && showBytecode;

		const tree = compileMode ? (
			<AstView
				ast={trace?.ast ?? null}
				steps={steps}
				stepIndex={player.index}
				currentNodeId={compileProgress.currentNodeId}
				errorNodeId={null}
				errorLine={null}
				hoveredNodeId={effectiveNodeId}
				onHoverNode={setHoveredNodeId}
				onSelectNode={togglePinnedNode}
				trailNodeIds={compileProgress.trailNodeIds}
				revealedNodeIds={compileProgress.revealedNodeIds}
			/>
		) : (
			<AstView {...astViewProps} />
		);

		const bytecodePanel = compileMode ? (
			<BytecodeView
				bytecode={grownBytecode}
				steps={steps}
				stepIndex={player.index}
				errorOffset={null}
				hoveredNodeId={effectiveNodeId}
				onHoverNode={setHoveredNodeId}
				onSelectNode={togglePinnedNode}
				currentOffset={compileCurrentOffset}
				pendingOffsets={pendingOffsets}
			/>
		) : (
			<BytecodeView {...bytecodeViewProps} />
		);

		const inner = (
			<>
				{showTree && tree}
				{showBytecode && bytecodePanel}
				{compileMode && showBoth && <CompileChipLayer flight={compileFlight} />}
			</>
		);

		structureContent = showBoth ? (
			<div className={styles.compareRow}>{inner}</div>
		) : (
			inner
		);
	}

	return (
		<div className={styles.app}>
			<Toolbar
				onRun={run}
				running={running}
				hasTrace={activeHasTrace}
				markers={activeMode === "execution" ? executionMarkers : []}
				mode={activeMode}
				playing={activePlayer.playing}
				speed={activePlayer.speed}
				stepIndex={activePlayer.index}
				totalSteps={activePlayer.total}
				currentLine={activeCurrentLine}
				onTogglePlay={activePlayer.togglePlay}
				onPrevious={activePlayer.previous}
				onNext={activePlayer.next}
				onNextLine={activePlayer.nextLine}
				onReset={activePlayer.reset}
				onSeek={activePlayer.goTo}
				onSpeedChange={activePlayer.setSpeed}
				theme={theme}
				onToggleTheme={toggleTheme}
				phase={phase}
				compiling={compileMode}
				onSelectPhase={selectPhase}
				truncated={trace?.truncated ?? false}
			/>

			<main ref={workspaceRef} className={styles.workspace}>
				<div className={styles.editorColumn}>
					<CodeEditor
						value={program}
						onChange={setProgram}
						currentLine={activeCurrentLine}
						errorLine={activeMode === "execution" ? gatedErrorLine : null}
						hoverLine={effectiveHoverLine}
						hoverColor={effectiveHoverColor}
					/>
				</div>
				<div className={styles.visualColumn}>
					<div className={styles.structurePanel}>
						<div className={styles.structureHeader}>
							{compileMode && (
								<span className={styles.depthIndicator}>
									profundidade da travessia: {compileProgress.depth}
								</span>
							)}
							<button
								className={compileToggleClassName}
								onClick={toggleCompileMode}
								disabled={!hasCompileTrace}
								title="ver a árvore virando bytecode, passo a passo"
							>
								<Binary size="1rem" />
								{compileMode ? "voltar à execução" : "modo compilação"}
							</button>
						</div>
						{structureContent}
					</div>
					{compileMode && (
						<div className={styles.bottomRowCompact}>
							<CompileNarration
								step={compileCurrentStep}
								astIndex={astIndex}
								emitCountByNode={emitCountByNode}
							/>
						</div>
					)}
					{!compileMode && phase === "arvore" && (
						<div className={styles.bottomRow}>
							<AstNodeInspector node={inspectedNode} statusLabel={inspectedStatusLabel} />
							<AstNodeInsights
								node={inspectedNode}
								resolveMap={resolveMap}
								astCountsByLine={astCountsByLine}
								bytecodeCountsByLine={bytecodeCountsByLine}
							/>
						</div>
					)}
					{!compileMode && phase === "bytecode" && (
						<div className={styles.bottomRowCompact}>
							<ConstantPoolView constants={trace?.constants ?? []} />
						</div>
					)}
					{!compileMode && phase === "execucao" && (
						<div className={styles.bottomRow}>
							<VariablesView
								step={hasTrace ? player.currentStep : null}
								previousStep={previousStep}
							/>
							<StackView
								step={hasTrace ? player.currentStep : null}
								output={output}
								error={errorReached ? errorMessage : null}
								hasBytecode={(trace?.bytecode.length ?? 0) > 0}
								maxStackDepth={maxStackUsage}
							/>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
