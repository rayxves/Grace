import {
	ChevronLeft,
	ChevronRight,
	ChevronsRight,
	Pause,
	Play,
	SkipBack,
} from "lucide-react";
import { PLAYER_SPEEDS } from "../../hooks/usePlayer";
import { ViewTabs } from "../ViewTabs/ViewTabs";
import { PipelineStrip, type Phase } from "../PipelineStrip/PipelineStrip";
import type { Mode as AppMode } from "../../screens/Visualizer";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
	onRun: () => void;
	running: boolean;
	hasTrace: boolean;
	mode: "execution" | "compilation";
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
	onSelectMode: (mode: "execution" | "compilation") => void;
	phase: Phase;
	compiling: boolean;
	onSelectPhase: (phase: Phase) => void;
	appMode: AppMode;
	onSelectAppMode: (mode: AppMode) => void;
}

const ICON_SIZE = "1.125rem";

const SPEED_TABS = PLAYER_SPEEDS.map((speed) => ({
	id: String(speed),
	label: `${speed}x`,
}));

const MODE_TABS: { id: ToolbarProps["mode"]; label: string }[] = [
	{ id: "execution", label: "execução" },
	{ id: "compilation", label: "compilação" },
];

const APP_MODE_TABS: { id: AppMode; label: string }[] = [
	{ id: "full", label: "modo completo" },
	{ id: "stage", label: "modo palco" },
];

export function Toolbar({
	onRun,
	running,
	hasTrace,
	mode,
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
	onSelectMode,
	phase,
	compiling,
	onSelectPhase,
	appMode,
	onSelectAppMode,
}: Readonly<ToolbarProps>) {
	const atStart = stepIndex === 0;
	const atEnd = totalSteps === 0 || stepIndex >= totalSteps - 1;

	return (
		<header className={styles.toolbar}>
			<div className={styles.topRow}>
				<div className={styles.controls}>
					<button
						className={styles.runButton}
						onClick={onRun}
						disabled={running}
					>
						{running ? "executando…" : "executar"}
					</button>

					<div className={styles.modeSwitch}>
						<ViewTabs tabs={MODE_TABS} activeId={mode} onSelect={onSelectMode} />
					</div>

					<div className={styles.playerCard} title="controles de animação do passo a passo">
						<div className={styles.playerGroup}>
							<button
								className={styles.control}
								onClick={onReset}
								disabled={!hasTrace || atStart}
								title="reiniciar"
							>
								<SkipBack size={ICON_SIZE} />
							</button>
							<button
								className={styles.controlBack}
								onClick={onPrevious}
								disabled={!hasTrace || atStart}
								title="voltar um passo (seta esquerda)"
							>
								<ChevronLeft size={ICON_SIZE} />
							</button>
							<button
								className={playing ? `${styles.control} ${styles.controlPlaying}` : styles.control}
								onClick={onTogglePlay}
								disabled={!hasTrace || atEnd}
								title={playing ? "pausar (espaço)" : "correr (espaço)"}
							>
								{playing ? (
									<Pause size={ICON_SIZE} />
								) : (
									<Play size={ICON_SIZE} />
								)}
							</button>
							<button
								className={styles.control}
								onClick={onNext}
								disabled={!hasTrace || atEnd}
								title="próximo passo (seta direita)"
							>
								<ChevronRight size={ICON_SIZE} />
							</button>
							{mode === "execution" && (
								<button
									className={styles.controlLabeled}
									onClick={onNextLine}
									disabled={!hasTrace || atEnd}
									title="avançar até a próxima linha"
								>
									linha
									<ChevronsRight size={ICON_SIZE} />
								</button>
							)}
						</div>

						<span className={styles.playerDivider} aria-hidden="true" />

						<ViewTabs<string>
							tabs={SPEED_TABS}
							activeId={String(speed)}
							onSelect={(id) => onSpeedChange(Number(id))}
						/>
					</div>
				</div>
			</div>

			<div className={styles.appModeRow}>
				<ViewTabs tabs={APP_MODE_TABS} activeId={appMode} onSelect={onSelectAppMode} />
			</div>

			<PipelineStrip phase={phase} compiling={compiling} onSelect={onSelectPhase} />
		</header>
	);
}
