import { useMemo } from "react";
import { CodeEditor } from "../../components/CodeEditor/CodeEditor";
import { useRoute } from "../../hooks/useRoute";
import { usePlayer } from "../../hooks/usePlayer";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { parseErrorLine } from "../../lib/errors";
import { nodeAccentColor } from "../../lib/nodeColor";
import type { Trace } from "../../types";
import type { Mode } from "../Visualizer";
import { Scene } from "./Scene";
import { StageControls } from "./StageControls";
import styles from "./Stage.module.css";

interface StageProps {
	trace: Trace | null;
	running: boolean;
	runtimeError: string | null;
	run: () => void;
	appMode: Mode;
	onSelectAppMode: (mode: Mode) => void;
}

const EMPTY_STEPS: Trace["steps"] = [];

export function Stage({
	trace,
	running,
	runtimeError,
	run,
	appMode,
	onSelectAppMode,
}: Readonly<StageProps>) {
	const { program, setProgram } = useRoute();

	const steps = trace?.steps ?? EMPTY_STEPS;
	const stepPlayer = usePlayer(steps, (step) => step.line);
	const hasPlayback = steps.length > 0;

	useKeyboardShortcuts({
		enabled: hasPlayback,
		onNext: stepPlayer.next,
		onPrevious: stepPlayer.previous,
		onTogglePlay: stepPlayer.togglePlay,
		onReset: stepPlayer.reset,
	});

	const errorMessage = runtimeError ?? trace?.error ?? null;
	const errorLine = useMemo(() => parseErrorLine(errorMessage), [errorMessage]);

	const currentStep = steps[stepPlayer.index] ?? null;
	const currentLine = currentStep?.line ?? null;
	const currentNodeId = currentStep?.nodeId ?? null;

	const atLastStep = hasPlayback && stepPlayer.index >= stepPlayer.total - 1;
	const errorReached = errorMessage !== null && (!hasPlayback || atLastStep);

	return (
		<div className={styles.app}>
			<StageControls
				onRun={run}
				running={running}
				hasPlayback={hasPlayback}
				player={stepPlayer}
				appMode={appMode}
				onSelectAppMode={onSelectAppMode}
			/>
			<div className={styles.workspace}>
				<div className={styles.editorColumn}>
					<CodeEditor
						value={program}
						onChange={setProgram}
						currentLine={currentLine}
						errorLine={errorReached ? errorLine : null}
						hoverLine={null}
						hoverColor={nodeAccentColor(currentNodeId)}
					/>
				</div>
				<div className={styles.sceneColumn}>
					<Scene
						trace={trace}
						step={currentStep}
						stepIndex={stepPlayer.index}
						speed={stepPlayer.speed}
						error={errorReached ? errorMessage : null}
						hasBytecode={(trace?.bytecode.length ?? 0) > 0}
					/>
				</div>
			</div>
		</div>
	);
}
