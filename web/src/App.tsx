import { useCallback, useMemo, useState } from "react";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { CodeEditor } from "./components/CodeEditor/CodeEditor";
import { AstView } from "./components/AstView/AstView";
import { StackView } from "./components/StackView/StackView";
import { usePlayer } from "./hooks/usePlayer";
import { useTheme } from "./hooks/useTheme";
import { runGrace } from "./lib/grace";
import { collectOutput } from "./lib/instructions";
import type { Trace } from "./types";
import styles from "./App.module.css";

const DEFAULT_SOURCE = `var x = 10;
imprima(x + 5);

var contador = 0;
enquanto (contador < 3) {
	imprima(contador);
	contador = contador + 1;
}
`;

const EMPTY_STEPS: Trace["steps"] = [];

function App() {
	const { theme, toggleTheme } = useTheme();
	const [source, setSource] = useState(DEFAULT_SOURCE);
	const [trace, setTrace] = useState<Trace | null>(null);
	const [running, setRunning] = useState(false);
	const [runtimeError, setRuntimeError] = useState<string | null>(null);

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

	const errorLine = useMemo(() => {
		const match = errorMessage ? /^Linha (\d+)/.exec(errorMessage) : null;
		return match ? Number(match[1]) : null;
	}, [errorMessage]);

	const atLastStep = hasTrace && player.index >= player.total - 1;
	const errorReached = errorMessage !== null && (!hasTrace || atLastStep);

	const previousStep =
		hasTrace && player.index > 0 ? steps[player.index - 1] : null;

	const output = useMemo(
		() => (hasTrace ? collectOutput(steps, player.index) : []),
		[hasTrace, steps, player.index],
	);

	return (
		<div className={styles.app}>
			<Toolbar
				onRun={run}
				running={running}
				hasTrace={hasTrace}
				playing={player.playing}
				stepIndex={player.index}
				totalSteps={player.total}
				currentLine={currentLine}
				onTogglePlay={player.togglePlay}
				onPrevious={player.previous}
				onNext={player.next}
				onNextLine={player.nextLine}
				onReset={player.reset}
				theme={theme}
				onToggleTheme={toggleTheme}
			/>

			<main className={styles.workspace}>
				<div className={styles.editorColumn}>
					<CodeEditor
						value={source}
						onChange={setSource}
						currentLine={hasTrace ? currentLine : null}
						errorLine={errorReached ? errorLine : null}
					/>
				</div>
				<div className={styles.visualColumn}>
					<AstView
						ast={trace?.ast ?? null}
						steps={steps}
						stepIndex={player.index}
						currentLine={hasTrace ? currentLine : null}
						errorLine={errorReached ? errorLine : null}
					/>
					<StackView
						step={hasTrace ? player.currentStep : null}
						previousStep={previousStep}
						output={output}
						error={errorReached ? errorMessage : null}
					/>
				</div>
			</main>
		</div>
	);
}

export default App;
