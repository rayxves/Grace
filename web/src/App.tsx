import { useCallback, useMemo, useState } from "react";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { CodeEditor } from "./components/CodeEditor/CodeEditor";
import { AstView } from "./components/AstView/AstView";
import { BytecodeView } from "./components/BytecodeView/BytecodeView";
import { StackView } from "./components/StackView/StackView";
import { ViewTabs } from "./components/ViewTabs/ViewTabs";
import { usePlayer } from "./hooks/usePlayer";
import { useTheme } from "./hooks/useTheme";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { runGrace } from "./lib/grace";
import { collectOutput } from "./lib/instructions";
import { parseErrorLine } from "./lib/errors";
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

function App() {
	const { theme, toggleTheme } = useTheme();
	const [source, setSource] = useState(DEFAULT_SOURCE);
	const [trace, setTrace] = useState<Trace | null>(null);
	const [running, setRunning] = useState(false);
	const [runtimeError, setRuntimeError] = useState<string | null>(null);
	const [structureView, setStructureView] = useState<StructureView>("bytecode");

	const steps = trace?.steps ?? EMPTY_STEPS;
	const player = usePlayer(steps);

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
	const currentLine = player.currentStep?.line ?? null;
	const errorMessage = runtimeError ?? trace?.error ?? null;

	const errorLine = useMemo(
		() => parseErrorLine(errorMessage),
		[errorMessage],
	);

	const atLastStep = hasTrace && player.index >= player.total - 1;
	const errorReached = errorMessage !== null && (!hasTrace || atLastStep);

	const gatedCurrentLine = hasTrace ? currentLine : null;
	const gatedErrorLine = errorReached ? errorLine : null;
	const gatedErrorOffset = errorReached ? (trace?.errorOffset ?? null) : null;

	const output = useMemo(
		() => (hasTrace ? collectOutput(steps, player.index) : []),
		[hasTrace, steps, player.index],
	);

	useKeyboardShortcuts({
		enabled: hasTrace,
		onNext: player.next,
		onPrevious: player.previous,
		onTogglePlay: player.togglePlay,
		onReset: player.reset,
	});

	return (
		<div className={styles.app}>
			<Toolbar
				onRun={run}
				running={running}
				hasTrace={hasTrace}
				steps={steps}
				playing={player.playing}
				speed={player.speed}
				stepIndex={player.index}
				totalSteps={player.total}
				currentLine={currentLine}
				onTogglePlay={player.togglePlay}
				onPrevious={player.previous}
				onNext={player.next}
				onNextLine={player.nextLine}
				onReset={player.reset}
				onSeek={player.goTo}
				onSpeedChange={player.setSpeed}
				theme={theme}
				onToggleTheme={toggleTheme}
			/>

			<main className={styles.workspace}>
				<div className={styles.editorColumn}>
					<CodeEditor
						value={source}
						onChange={setSource}
						currentLine={gatedCurrentLine}
						errorLine={gatedErrorLine}
					/>
				</div>
				<div className={styles.visualColumn}>
					<div className={styles.structurePanel}>
						<ViewTabs<StructureView>
							tabs={STRUCTURE_VIEW_TABS}
							activeId={structureView}
							onSelect={setStructureView}
						/>
						{structureView === "tree" ? (
							<AstView
								ast={trace?.ast ?? null}
								steps={steps}
								stepIndex={player.index}
								currentLine={gatedCurrentLine}
								errorLine={gatedErrorLine}
							/>
						) : (
							<BytecodeView
								bytecode={trace?.bytecode ?? EMPTY_BYTECODE}
								steps={steps}
								stepIndex={player.index}
								errorOffset={gatedErrorOffset}
							/>
						)}
					</div>
					<StackView
						step={hasTrace ? player.currentStep : null}
						output={output}
						error={errorReached ? errorMessage : null}
						hasBytecode={(trace?.bytecode.length ?? 0) > 0}
					/>
				</div>
			</main>
		</div>
	);
}

export default App;
