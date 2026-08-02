import { useCallback, useState } from "react";
import { ModoCompleto } from "./modes/ModoCompleto";
import { Palco } from "./modes/Palco";
import { ViewTabs } from "../components/ViewTabs/ViewTabs";
import { useRoute } from "../hooks/useRoute";
import { runGrace } from "../lib/grace";
import type { Trace } from "../types";
import styles from "./Visualizador.module.css";

type Modo = "completo" | "palco";

const MODO_TABS = [
	{ id: "completo" as const, label: "modo completo" },
	{ id: "palco" as const, label: "modo palco" },
];

export function Visualizador() {
	const { program } = useRoute();
	const [modo, setModo] = useState<Modo>("completo");
	const [trace, setTrace] = useState<Trace | null>(null);
	const [running, setRunning] = useState(false);
	const [runtimeError, setRuntimeError] = useState<string | null>(null);

	const run = useCallback(async () => {
		setRunning(true);
		setRuntimeError(null);
		try {
			const result = await runGrace(program);
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
			<div className={styles.modoSwitch}>
				<ViewTabs tabs={MODO_TABS} activeId={modo} onSelect={setModo} />
			</div>
			{modo === "completo" ? (
				<ModoCompleto
					trace={trace}
					running={running}
					runtimeError={runtimeError}
					run={run}
				/>
			) : (
				<Palco
					trace={trace}
					running={running}
					runtimeError={runtimeError}
					run={run}
				/>
			)}
		</div>
	);
}
