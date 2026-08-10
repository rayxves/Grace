import type { ReactNode } from "react";
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
import { ChallengeGallery } from "../ChallengeGallery/ChallengeGallery";
import styles from "./PlayerBar.module.css";

const ICON_SIZE = "1.125rem";

const SPEED_TABS = PLAYER_SPEEDS.map((speed) => ({
	id: String(speed),
	label: `${speed}x`,
}));

interface PlayerBarProps {
	onRun: () => void;
	running: boolean;
	hasPlayback: boolean;
	playing: boolean;
	speed: number;
	stepIndex: number;
	totalSteps: number;
	onTogglePlay: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onReset: () => void;
	onSpeedChange: (speed: number) => void;
	onNextLine?: () => void;
	appModeSlot: ReactNode;
	children?: ReactNode;
}

export function PlayerBar({
	onRun,
	running,
	hasPlayback,
	playing,
	speed,
	stepIndex,
	totalSteps,
	onTogglePlay,
	onPrevious,
	onNext,
	onReset,
	onSpeedChange,
	onNextLine,
	appModeSlot,
	children,
}: Readonly<PlayerBarProps>) {
	const atStart = stepIndex === 0;
	const atEnd = totalSteps === 0 || stepIndex >= totalSteps - 1;

	return (
		<header className={styles.bar}>
			<div className={styles.topRow}>
				<button className={styles.runButton} onClick={onRun} disabled={running}>
					{running ? "executando…" : "executar"}
				</button>

				<div className={styles.modeSlot}>{appModeSlot}</div>

				<ChallengeGallery />

				{hasPlayback && (
					<div className={styles.playerCard} title="controles de animação do passo a passo">
						<div className={styles.playerGroup}>
							<button
								className={styles.control}
								onClick={onReset}
								disabled={!hasPlayback || atStart}
								title="reiniciar"
							>
								<SkipBack size={ICON_SIZE} />
							</button>
							<button
								className={styles.control}
								onClick={onPrevious}
								disabled={!hasPlayback || atStart}
								title="voltar um passo (seta esquerda)"
							>
								<ChevronLeft size={ICON_SIZE} />
							</button>
							<button
								className={playing ? `${styles.control} ${styles.controlPlaying}` : styles.control}
								onClick={onTogglePlay}
								disabled={!hasPlayback || atEnd}
								title={playing ? "pausar (espaço)" : "correr (espaço)"}
							>
								{playing ? <Pause size={ICON_SIZE} /> : <Play size={ICON_SIZE} />}
							</button>
							<button
								className={styles.control}
								onClick={onNext}
								disabled={!hasPlayback || atEnd}
								title="próximo passo (seta direita)"
							>
								<ChevronRight size={ICON_SIZE} />
							</button>
							{onNextLine && (
								<button
									className={styles.controlLabeled}
									onClick={onNextLine}
									disabled={!hasPlayback || atEnd}
									title="avançar até a próxima linha"
								>
									próxima linha
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
				)}
			</div>

			{children}
		</header>
	);
}
