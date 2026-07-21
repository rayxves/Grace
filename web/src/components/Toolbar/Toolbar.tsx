import type { Theme } from "../../hooks/useTheme";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
	onRun: () => void;
	running: boolean;
	hasTrace: boolean;
	playing: boolean;
	stepIndex: number;
	totalSteps: number;
	currentLine: number | null;
	onTogglePlay: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onNextLine: () => void;
	onReset: () => void;
	theme: Theme;
	onToggleTheme: () => void;
}

export function Toolbar({
	onRun,
	running,
	hasTrace,
	playing,
	stepIndex,
	totalSteps,
	currentLine,
	onTogglePlay,
	onPrevious,
	onNext,
	onNextLine,
	onReset,
	theme,
	onToggleTheme,
}: Readonly<ToolbarProps>) {
	const atStart = stepIndex === 0;
	const atEnd = totalSteps === 0 || stepIndex >= totalSteps - 1;

	return (
		<header className={styles.toolbar}>
			<div className={styles.brand}>
				<span className={styles.logo}>Grace</span>
				<span className={styles.subtitle}>visualizador de execução</span>
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
						⏮
					</button>
					<button
						className={styles.control}
						onClick={onPrevious}
						disabled={!hasTrace || atStart}
						title="passo anterior"
					>
						←
					</button>
					<button
						className={styles.control}
						onClick={onTogglePlay}
						disabled={!hasTrace || atEnd}
						title={playing ? "pausar" : "correr"}
					>
						{playing ? "⏸" : "▶"}
					</button>
					<button
						className={styles.control}
						onClick={onNext}
						disabled={!hasTrace || atEnd}
						title="próximo passo"
					>
						→
					</button>
					<button
						className={styles.controlLabeled}
						onClick={onNextLine}
						disabled={!hasTrace || atEnd}
						title="avançar até a próxima linha"
					>
						linha →
					</button>
				</div>

				<span className={styles.position}>
					{hasTrace && totalSteps > 0
						? `passo ${stepIndex + 1} de ${totalSteps}` +
							(currentLine !== null ? ` — linha ${currentLine}` : "")
						: "pronto para executar"}
				</span>
			</div>

			<button
				className={styles.themeButton}
				onClick={onToggleTheme}
				title={theme === "light" ? "tema escuro" : "tema claro"}
			>
				{theme === "light" ? "🌙" : "☀️"}
			</button>
		</header>
	);
}
