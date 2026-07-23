import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Binary, Columns2 } from "lucide-react";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { CodeEditor } from "./components/CodeEditor/CodeEditor";
import { AstView } from "./components/AstView/AstView";
import { BytecodeView } from "./components/BytecodeView/BytecodeView";
import { StackView } from "./components/StackView/StackView";
import { VariablesView } from "./components/VariablesView/VariablesView";
import { ViewTabs } from "./components/ViewTabs/ViewTabs";
import type { ScrubberMarker } from "./components/Scrubber/Scrubber";
import { CompileChipLayer } from "./components/CompileChipLayer/CompileChipLayer";
import { CompileNarration } from "./components/CompileNarration/CompileNarration";
import { usePlayer } from "./hooks/usePlayer";
import { useTheme } from "./hooks/useTheme";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useHighlightState } from "./hooks/useHighlightState";
import { useCompileFlight } from "./hooks/useCompileFlight";
import { runGrace } from "./lib/grace";
import { collectOutput } from "./lib/instructions";
import { parseErrorLine } from "./lib/errors";
import { computeCompileProgress, growBytecodeUpTo } from "./lib/compileProgress";
import { buildAstNodeIndex } from "./lib/astIndex";
import { countEmitsByNode } from "./lib/compileNarration";
import type { Trace } from "./types";
import styles from "./App.module.css";

type StructureView = "bytecode" | "tree";

const STRUCTURE_VIEW_TABS: { id: StructureView; label: string }[] = [
	{ id: "bytecode", label: "bytecode" },
	{ id: "tree", label: "árvore" },
];

const DEFAULT_SOURCE = `var x = 10;
imprima(x + 5);

var contador = 0;
enquanto (contador < 3) {
	imprima(contador);
	contador = contador + 1;
}
`;

const EMPTY_STEPS: Trace["steps"] = [];
const EMPTY_BYTECODE: Trace["bytecode"] = [];
const EMPTY_COMPILE_STEPS: Trace["compileSteps"] = [];

function App() {
	const { theme, toggleTheme } = useTheme();
	const [source, setSource] = useState(DEFAULT_SOURCE);
	const [trace, setTrace] = useState<Trace | null>(null);
	const [running, setRunning] = useState(false);
	const [runtimeError, setRuntimeError] = useState<string | null>(null);
	const [structureView, setStructureView] = useState<StructureView>("bytecode");
	const [compareMode, setCompareMode] = useState(false);
	const [compileMode, setCompileMode] = useState(false);
	const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

	const steps = trace?.steps ?? EMPTY_STEPS;
	const bytecode = trace?.bytecode ?? EMPTY_BYTECODE;
	const compileSteps = trace?.compileSteps ?? EMPTY_COMPILE_STEPS;
	const player = usePlayer(steps, (step) => step.line);
	const compilePlayer = usePlayer(compileSteps, () => null);

	const run = useCallback(async () => {
		setRunning(true);
		setRuntimeError(null);
		try {
			const result = await runGrace(source);
			setTrace(result);
		} catch (error) {
			setTrace(null);
			setRuntimeError(error instanceof Error ? error.message : String(error));
		} finally {
			setRunning(false);
		}
	}, [source]);

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
		hoveredNodeId,
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

	const compileCurrentStep = compilePlayer.currentStep;
	const compileCurrentOffset =
		compileCurrentStep?.kind === "emit"
			? compileCurrentStep.offset
			: (grownBytecode.at(-1)?.offset ?? null);
	const compileCurrentLine =
		compileCurrentStep?.kind === "enter" || compileCurrentStep?.kind === "emit"
			? compileCurrentStep.line
			: null;

	const selectStructureView = useCallback((view: StructureView) => {
		setStructureView(view);
		setCompareMode(false);
	}, []);

	const toggleCompareMode = useCallback(() => {
		setCompareMode((value) => !value);
	}, []);

	const toggleCompileMode = useCallback(() => {
		setCompileMode((value) => !value);
	}, []);

	const activeHasTrace = compileMode ? hasCompileTrace : hasTrace;
	const activeCurrentLine = compileMode ? compileCurrentLine : gatedCurrentLine;

	useKeyboardShortcuts({
		enabled: activeHasTrace,
		onNext: compileMode ? compilePlayer.next : player.next,
		onPrevious: compileMode ? compilePlayer.previous : player.previous,
		onTogglePlay: compileMode ? compilePlayer.togglePlay : player.togglePlay,
		onReset: compileMode ? compilePlayer.reset : player.reset,
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
		hoveredNodeId,
		onHoverNode: setHoveredNodeId,
	};

	const bytecodeViewProps = {
		bytecode,
		steps,
		stepIndex: player.index,
		errorOffset: gatedErrorOffset,
		hoveredNodeId,
		onHoverNode: setHoveredNodeId,
	};

	const compareToggleClassName = compareMode
		? `${styles.compareToggle} ${styles.compareToggleActive}`
		: styles.compareToggle;

	const compileToggleClassName = compileMode
		? `${styles.compareToggle} ${styles.compareToggleActive}`
		: styles.compareToggle;

	let structureContent: ReactNode;
	if (compileMode) {
		structureContent = (
			<div className={styles.compareRow}>
				<AstView
					ast={trace?.ast ?? null}
					steps={steps}
					stepIndex={player.index}
					currentNodeId={compileProgress.currentNodeId}
					errorNodeId={null}
					errorLine={null}
					hoveredNodeId={hoveredNodeId}
					onHoverNode={setHoveredNodeId}
					trailNodeIds={compileProgress.trailNodeIds}
					revealedNodeIds={compileProgress.revealedNodeIds}
				/>
				<BytecodeView
					bytecode={grownBytecode}
					steps={steps}
					stepIndex={player.index}
					errorOffset={null}
					hoveredNodeId={hoveredNodeId}
					onHoverNode={setHoveredNodeId}
					currentOffset={compileCurrentOffset}
					pendingOffsets={pendingOffsets}
				/>
				<CompileChipLayer flight={compileFlight} />
			</div>
		);
	} else if (compareMode) {
		structureContent = (
			<div className={styles.compareRow}>
				<AstView {...astViewProps} />
				<BytecodeView {...bytecodeViewProps} />
			</div>
		);
	} else if (structureView === "tree") {
		structureContent = <AstView {...astViewProps} />;
	} else {
		structureContent = <BytecodeView {...bytecodeViewProps} />;
	}

	return (
		<div className={styles.app}>
			<Toolbar
				onRun={run}
				running={running}
				hasTrace={activeHasTrace}
				markers={compileMode ? [] : executionMarkers}
				mode={compileMode ? "compilation" : "execution"}
				playing={compileMode ? compilePlayer.playing : player.playing}
				speed={compileMode ? compilePlayer.speed : player.speed}
				stepIndex={compileMode ? compilePlayer.index : player.index}
				totalSteps={compileMode ? compilePlayer.total : player.total}
				currentLine={activeCurrentLine}
				onTogglePlay={compileMode ? compilePlayer.togglePlay : player.togglePlay}
				onPrevious={compileMode ? compilePlayer.previous : player.previous}
				onNext={compileMode ? compilePlayer.next : player.next}
				onNextLine={compileMode ? compilePlayer.nextLine : player.nextLine}
				onReset={compileMode ? compilePlayer.reset : player.reset}
				onSeek={compileMode ? compilePlayer.goTo : player.goTo}
				onSpeedChange={compileMode ? compilePlayer.setSpeed : player.setSpeed}
				theme={theme}
				onToggleTheme={toggleTheme}
			/>

			<main className={styles.workspace}>
				<div className={styles.editorColumn}>
					<CodeEditor
						value={source}
						onChange={setSource}
						currentLine={activeCurrentLine}
						errorLine={compileMode ? null : gatedErrorLine}
						hoverLine={hoverLine}
					/>
				</div>
				<div className={styles.visualColumn}>
					<div className={styles.structurePanel}>
						<div className={styles.structureHeader}>
							{compileMode ? (
								<span className={styles.depthIndicator}>
									profundidade da travessia: {compileProgress.depth}
								</span>
							) : (
								<>
									<ViewTabs<StructureView>
										tabs={STRUCTURE_VIEW_TABS}
										activeId={structureView}
										onSelect={selectStructureView}
									/>
									<button
										className={compareToggleClassName}
										onClick={toggleCompareMode}
										title="ver árvore e bytecode lado a lado"
									>
										<Columns2 size="1rem" />
										comparar
									</button>
								</>
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
					{compileMode ? (
						<div className={styles.bottomRowCompact}>
							<CompileNarration
								step={compileCurrentStep}
								astIndex={astIndex}
								emitCountByNode={emitCountByNode}
							/>
						</div>
					) : (
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
							/>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

export default App;
