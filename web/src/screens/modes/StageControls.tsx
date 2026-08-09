import { AppModeSwitch } from "../../components/AppModeSwitch/AppModeSwitch";
import { PlayerBar } from "../../components/PlayerBar/PlayerBar";
import type { Mode as AppMode } from "../Visualizer";

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
			appModeSlot={<AppModeSwitch appMode={appMode} onSelectAppMode={onSelectAppMode} />}
		/>
	);
}
