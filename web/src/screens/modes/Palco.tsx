import type { Trace } from "../../types";
import styles from "./Palco.module.css";

interface PalcoProps {
	trace: Trace | null;
	running: boolean;
	runtimeError: string | null;
	run: () => void;
}

export function Palco({ trace, running, runtimeError, run }: Readonly<PalcoProps>) {
	void trace;
	void running;
	void runtimeError;
	void run;
	return (
		<div className={styles.app}>
			<div className={styles.placeholder}>
				<p>o modo palco está em construção</p>
			</div>
		</div>
	);
}
