import { ViewTabs } from "../../components/ViewTabs/ViewTabs";
import { PlayerBar } from "../../components/PlayerBar/PlayerBar";
import type { Mode as AppMode } from "../Visualizer";

const APP_MODE_TABS: { id: AppMode; label: string }[] = [
	{ id: "full", label: "modo completo" },
	{ id: "stage", label: "modo palco" },
];

interface PlayerLike {
	index: number;
	total: number;
	playing: boolean;
	speed: number;
	next: () => void;
	previous: () => void;
	togglePlay: () => void;
	reset: () => void;
	goTo: (index: number) => void;
	setSpeed: (speed: number) => void;
}

interface StageControlsProps {
	onRun: () => void;
	running: boolean;
	hasPlayback: boolean;
	player: PlayerLike;
	appMode: AppMode;
	onSelectAppMode: (mode: AppMode) => void;
}

export function StageControls({
	onRun,
	running,
	hasPlayback,
	player,
	appMode,
	onSelectAppMode,
}: Readonly<StageControlsProps>) {
	return (
		<PlayerBar
			onRun={onRun}
			running={running}
			hasPlayback={hasPlayback}
			playing={player.playing}
			speed={player.speed}
			stepIndex={player.index}
			totalSteps={player.total}
			onTogglePlay={player.togglePlay}
			onPrevious={player.previous}
			onNext={player.next}
			onReset={player.reset}
			onSpeedChange={player.setSpeed}
			appModeSlot={<ViewTabs tabs={APP_MODE_TABS} activeId={appMode} onSelect={onSelectAppMode} />}
		/>
	);
}
