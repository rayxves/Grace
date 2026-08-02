import { useMemo, useState } from "react";
import { CodeEditor } from "../../components/CodeEditor/CodeEditor";
import { useRoute } from "../../hooks/useRoute";
import { usePlayer } from "../../hooks/usePlayer";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { buildBeats } from "../../lib/beats";
import { parseErrorLine } from "../../lib/errors";
import { nodeAccentColor } from "../../lib/nodeColor";
import type { Trace } from "../../types";
import type { Mode } from "../Visualizer";
import { ConstructionAct } from "./ConstructionAct";
import { ExecutionAct } from "./ExecutionAct";
import { StageControls } from "./StageControls";
import styles from "./Stage.module.css";

export type Act = "construction" | "execution";

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
	const [act, setAct] = useState<Act>("construction");

	const beats = useMemo(() => (trace ? buildBeats(trace) : []), [trace]);
	const beatPlayer = usePlayer(beats, (beat) => beat.line);

	const steps = trace?.steps ?? EMPTY_STEPS;
	const stepPlayer = usePlayer(steps, (step) => step.line);

	const activePlayer = act === "construction" ? beatPlayer : stepPlayer;
	const hasPlayback = act === "construction" ? beats.length > 0 : steps.length > 0;

	useKeyboardShortcuts({
		enabled: hasPlayback,
		onNext: activePlayer.next,
		onPrevious: activePlayer.previous,
		onTogglePlay: activePlayer.togglePlay,
		onReset: activePlayer.reset,
	});

	const errorMessage = runtimeError ?? trace?.error ?? null;
	const errorLine = useMemo(() => parseErrorLine(errorMessage), [errorMessage]);

	const currentBeat = beats[beatPlayer.index] ?? null;
	const currentStep = steps[stepPlayer.index] ?? null;
	let currentLine: number | null;
	let currentNodeId: number | null;
	if (act === "construction") {
		currentLine = currentBeat?.line ?? null;
		currentNodeId = currentBeat && "nodeId" in currentBeat ? currentBeat.nodeId : null;
	} else {
		currentLine = currentStep?.line ?? null;
		currentNodeId = currentStep?.nodeId ?? null;
	}

	return (
		<div className={styles.app}>
			<StageControls
				onRun={run}
				running={running}
				act={act}
				onSelectAct={setAct}
				hasPlayback={hasPlayback}
				player={activePlayer}
				appMode={appMode}
				onSelectAppMode={onSelectAppMode}
			/>
			<div className={styles.workspace}>
				<div className={styles.editorColumn}>
					{errorMessage && <p className={styles.errorBanner}>{errorMessage}</p>}
					<CodeEditor
						value={program}
						onChange={setProgram}
						currentLine={currentLine}
						errorLine={errorLine}
						hoverLine={null}
						hoverColor={nodeAccentColor(currentNodeId)}
					/>
				</div>
				<div className={styles.sceneColumn}>
					{act === "construction" ? (
						<ConstructionAct trace={trace} beats={beats} beatIndex={beatPlayer.index} />
					) : (
						<ExecutionAct trace={trace} step={currentStep} stepIndex={stepPlayer.index} />
					)}
				</div>
			</div>
		</div>
	);
}
