import { PipelineStrip } from "../PipelineStrip/PipelineStrip";
import type { Phase } from "../../lib/phase";
import { PlayerBar } from "../PlayerBar/PlayerBar";
import { ViewTabs } from "../ViewTabs/ViewTabs";
import type { Mode as AppMode } from "../../screens/Visualizer";

interface ToolbarProps {
	onRun: () => void;
	running: boolean;
	hasTrace: boolean;
	playing: boolean;
	speed: number;
	stepIndex: number;
	totalSteps: number;
	onTogglePlay: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onNextLine: () => void;
	onReset: () => void;
	onSpeedChange: (speed: number) => void;
	phase: Phase;
	onSelectPhase: (phase: Phase) => void;
	appMode: AppMode;
	onSelectAppMode: (mode: AppMode) => void;
}

const APP_MODE_TABS: { id: AppMode; label: string }[] = [
	{ id: "full", label: "modo completo" },
	{ id: "stage", label: "modo palco" },
];

export function Toolbar({
	onRun,
	running,
	hasTrace,
	playing,
	speed,
	stepIndex,
	totalSteps,
	onTogglePlay,
	onPrevious,
	onNext,
	onNextLine,
	onReset,
	onSpeedChange,
	phase,
	onSelectPhase,
	appMode,
	onSelectAppMode,
}: Readonly<ToolbarProps>) {
	return (
		<PlayerBar
			onRun={onRun}
			running={running}
			hasPlayback={hasTrace}
			playing={playing}
			speed={speed}
			stepIndex={stepIndex}
			totalSteps={totalSteps}
			onTogglePlay={onTogglePlay}
			onPrevious={onPrevious}
			onNext={onNext}
			onReset={onReset}
			onSpeedChange={onSpeedChange}
			onNextLine={onNextLine}
			appModeSlot={<ViewTabs tabs={APP_MODE_TABS} activeId={appMode} onSelect={onSelectAppMode} />}
		>
			<PipelineStrip phase={phase} onSelect={onSelectPhase} />
		</PlayerBar>
	);
}
