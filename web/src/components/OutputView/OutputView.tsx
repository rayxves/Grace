import styles from "./OutputView.module.css";

interface OutputViewProps {
	output: string[];
	error: string | null;
	reachedStep: boolean;
	hasBytecode: boolean;
}

export function OutputView({ output, error, reachedStep, hasBytecode }: Readonly<OutputViewProps>) {
	const isEmpty = output.length === 0 && !error;

	return (
		<div className={styles.zone}>
			<span className={styles.title}>Saída do programa</span>
			{isEmpty ? (
				<p className={styles.outputEmpty}>Nada foi impresso ainda</p>
			) : (
				<div className={styles.output}>
					{output.map((line, i) => (
						<span key={`${i}-${line}`} className={styles.outputLine}>
							{line}
						</span>
					))}
					{error && (
						<span className={styles.outputError} role="alert">
							{(() => {
								if (reachedStep) return "A execução parou aqui: ";
								if (hasBytecode) return "A execução falhou logo na primeira instrução: ";
								return "O programa não chegou a ser compilado: ";
							})()}
							{error}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
