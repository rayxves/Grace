import { useCallback, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { FullMode } from "./modes/FullMode";
import { Stage } from "./modes/Stage";
import { useRoute } from "../hooks/useRoute";
import { runGHopper } from "../lib/GHopper";
import { ChallengeBar } from "../components/ChallengeBar/ChallengeBar";
import type { Trace } from "../types";
import styles from "./Visualizer.module.css";

export type Mode = "full" | "stage";

export function Visualizer() {
	const { program } = useRoute();
	const [mode, setMode] = useState<Mode>("full");
	const [trace, setTrace] = useState<Trace | null>(null);
	const [running, setRunning] = useState(false);
	const [runtimeError, setRuntimeError] = useState<string | null>(null);

	const run = useCallback(async () => {
		setRunning(true);
		setRuntimeError(null);
		try {
			const result = await runGHopper(program);
			setTrace(result);
		} catch (error) {
			setTrace(null);
			setRuntimeError(error instanceof Error ? error.message : String(error));
		} finally {
			setRunning(false);
		}
	}, [program]);

	return (
		<div className={styles.shell}>
			<ChallengeBar />
			{trace?.truncated && (
				<div className={styles.truncatedWarning} role="alert">
					<AlertTriangle size="1rem" className={styles.truncatedIcon} />
					<span>
						A visualização foi cortada em 5.000 passos. O programa continuou executando além
						desse ponto, mas os passos seguintes não aparecem aqui.
					</span>
				</div>
			)}
			{mode === "full" ? (
				<FullMode
					trace={trace}
					running={running}
					runtimeError={runtimeError}
					run={run}
					appMode={mode}
					onSelectAppMode={setMode}
				/>
			) : (
				<Stage
					trace={trace}
					running={running}
					runtimeError={runtimeError}
					run={run}
					appMode={mode}
					onSelectAppMode={setMode}
				/>
			)}
		</div>
	);
}
