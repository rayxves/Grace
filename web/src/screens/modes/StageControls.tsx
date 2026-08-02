import { ChevronLeft, ChevronRight, Pause, Play, SkipBack } from "lucide-react";
import { ViewTabs } from "../../components/ViewTabs/ViewTabs";
import { PLAYER_SPEEDS } from "../../hooks/usePlayer";
import type { Mode as AppMode } from "../Visualizer";
import type { Act } from "./Stage";
import styles from "./StageControls.module.css";

const ICON_SIZE = "1.125rem";

const SPEED_TABS = PLAYER_SPEEDS.map((speed) => ({ id: String(speed), label: `${speed}x` }));

const ACT_TABS: { id: Act; label: string }[] = [
	{ id: "construction", label: "construção" },
	{ id: "execution", label: "execução" },
];

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
	act: Act;
	onSelectAct: (act: Act) => void;
	hasPlayback: boolean;
	player: PlayerLike;
	appMode: AppMode;
	onSelectAppMode: (mode: AppMode) => void;
}

export function StageControls({
	onRun,
	running,
	act,
	onSelectAct,
	hasPlayback,
	player,
	appMode,
	onSelectAppMode,
}: Readonly<StageControlsProps>) {
	const atStart = player.index === 0;
	const atEnd = player.total === 0 || player.index >= player.total - 1;

	return (
		<div className={styles.bar}>
			<div className={styles.topRow}>
				<button className={styles.runButton} onClick={onRun} disabled={running}>
					{running ? "executando…" : "executar"}
				</button>
				<div className={styles.actSwitch}>
					<ViewTabs tabs={ACT_TABS} activeId={act} onSelect={onSelectAct} />
				</div>
				<div className={styles.playerCard} title="controles de animação do passo a passo">
					<div className={styles.playerGroup}>
						<button
							className={styles.control}
							onClick={player.reset}
							disabled={!hasPlayback || atStart}
							title="reiniciar"
						>
							<SkipBack size={ICON_SIZE} />
						</button>
						<button
							className={styles.control}
							onClick={player.previous}
							disabled={!hasPlayback || atStart}
							title="voltar um passo (seta esquerda)"
						>
							<ChevronLeft size={ICON_SIZE} />
						</button>
						<button
							className={player.playing ? `${styles.control} ${styles.controlPlaying}` : styles.control}
							onClick={player.togglePlay}
							disabled={!hasPlayback || atEnd}
							title={player.playing ? "pausar (espaço)" : "correr (espaço)"}
						>
							{player.playing ? <Pause size={ICON_SIZE} /> : <Play size={ICON_SIZE} />}
						</button>
						<button
							className={styles.control}
							onClick={player.next}
							disabled={!hasPlayback || atEnd}
							title="próximo passo (seta direita)"
						>
							<ChevronRight size={ICON_SIZE} />
						</button>
					</div>
					<ViewTabs
						tabs={SPEED_TABS}
						activeId={String(player.speed)}
						onSelect={(id) => player.setSpeed(Number(id))}
					/>
				</div>
			</div>
			<div className={styles.appModeRow}>
				<ViewTabs tabs={APP_MODE_TABS} activeId={appMode} onSelect={onSelectAppMode} />
			</div>
		</div>
	);
}
