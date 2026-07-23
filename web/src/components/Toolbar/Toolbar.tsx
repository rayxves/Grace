import {
	ChevronLeft,
	ChevronRight,
	ChevronsRight,
	Moon,
	Pause,
	Play,
	SkipBack,
	Sun,
} from "lucide-react";
import type { Theme } from "../../hooks/useTheme";
import { PLAYER_SPEEDS } from "../../hooks/usePlayer";
import { Scrubber, type ScrubberMarker } from "../Scrubber/Scrubber";
import { ViewTabs } from "../ViewTabs/ViewTabs";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
	onRun: () => void;
	running: boolean;
	hasTrace: boolean;
	markers: ScrubberMarker[];
	mode: "execution" | "compilation";
	playing: boolean;
	speed: number;
	stepIndex: number;
	totalSteps: number;
	currentLine: number | null;
	onTogglePlay: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onNextLine: () => void;
	onReset: () => void;
	onSeek: (index: number) => void;
	onSpeedChange: (speed: number) => void;
	theme: Theme;
	onToggleTheme: () => void;
}

const ICON_SIZE = "1.125rem";

const SPEED_TABS = PLAYER_SPEEDS.map((speed) => ({
	id: String(speed),
	label: `${speed}x`,
}));

export function Toolbar({
	onRun,
	running,
	hasTrace,
	markers,
	mode,
	playing,
	speed,
	stepIndex,
	totalSteps,
	currentLine,
	onTogglePlay,
	onPrevious,
	onNext,
	onNextLine,
	onReset,
	onSeek,
	onSpeedChange,
	theme,
	onToggleTheme,
}: Readonly<ToolbarProps>) {
	const atStart = stepIndex === 0;
	const atEnd = totalSteps === 0 || stepIndex >= totalSteps - 1;

	let positionText = "pronto para executar";
	if (hasTrace && totalSteps > 0) {
		positionText = `passo ${stepIndex + 1} de ${totalSteps}`;
		if (currentLine !== null) {
			positionText += ` — linha ${currentLine}`;
		}
	}

	return (
		<header className={styles.toolbar}>
			<div className={styles.topRow}>
				<div className={styles.brand}>
					<span className={styles.logo}>Grace</span>
					<span className={styles.subtitle}>
						{mode === "compilation" ? "visualizador de compilação" : "visualizador de execução"}
					</span>
				</div>

				<div className={styles.controls}>
					<button
						className={styles.runButton}
						onClick={onRun}
						disabled={running}
					>
						{running ? "executando…" : "executar"}
					</button>

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
							voltar
						</button>
						<button
							className={styles.control}
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

					<ViewTabs<string>
						tabs={SPEED_TABS}
						activeId={String(speed)}
						onSelect={(id) => onSpeedChange(Number(id))}
					/>
				</div>

				<button
					className={styles.themeButton}
					onClick={onToggleTheme}
					title={theme === "light" ? "tema escuro" : "tema claro"}
				>
					{theme === "light" ? (
						<Moon size={ICON_SIZE} />
					) : (
						<Sun size={ICON_SIZE} />
					)}
				</button>
			</div>

			<div className={styles.scrubberRow}>
				<Scrubber
					length={totalSteps}
					index={stepIndex}
					onSeek={onSeek}
					markers={markers}
				/>
				<span className={styles.position}>{positionText}</span>
			</div>
		</header>
	);
}
