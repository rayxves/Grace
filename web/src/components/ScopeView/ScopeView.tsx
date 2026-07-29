import { useEffect, useRef } from "react";
import type { ResolveLogEntry, ScopeFrame } from "../../lib/resolveProgress";
import styles from "./ScopeView.module.css";

interface ScopeViewProps {
	frames: ScopeFrame[];
	log: ResolveLogEntry[];
	currentStepIndex: number;
	currentTargetSymbolId: string | null;
}

function frameLabel(frame: ScopeFrame): string {
	const base = frame.depth === 1 ? "escopo — profundidade 1 (mais externo)" : `escopo — profundidade ${frame.depth}`;
	return frame.closed ? `${base} (fechado)` : base;
}

function symbolState(symbol: { defined: boolean }, frameClosed: boolean): string {
	if (frameClosed) return "fechada";
	return symbol.defined ? "definida" : "declarada";
}

export function ScopeView({ frames, log, currentStepIndex, currentTargetSymbolId }: Readonly<ScopeViewProps>) {
	const currentLogRef = useRef<HTMLDivElement>(null);
	const currentLogEntry = log.at(-1)?.index === currentStepIndex ? log.at(-1) : null;

	useEffect(() => {
		currentLogRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [currentLogEntry]);

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>tabela de símbolos</h2>
			<p className={styles.hint}>
				Só blocos, funções e classes criam escopo aqui — variáveis globais não passam por
				resolução e não aparecem nesta tabela.
			</p>
			<div className={styles.content}>
				{frames.length === 0 ? (
					<p className={styles.empty}>nenhuma variável de escopo local declarada até aqui</p>
				) : (
					frames.map((frame) => (
						<div key={frame.frameId} className={styles.frameGroup}>
							<span className={styles.frameLabel}>{frameLabel(frame)}</span>
							{frame.symbols.length === 0 ? (
								<p className={styles.emptyFrame}>sem variáveis declaradas neste escopo</p>
							) : (
								<div className={styles.table}>
									<div className={styles.tableHeader}>
										<span>nome</span>
										<span>linha</span>
										<span>estado</span>
									</div>
									{frame.symbols.map((symbol) => {
										const isHighlighted = symbol.id === currentTargetSymbolId;
										return (
											<div
												key={symbol.id}
												className={isHighlighted ? `${styles.row} ${styles.rowHighlighted}` : styles.row}
											>
												<span className={styles.name}>{symbol.name}</span>
												<span className={styles.line}>{symbol.line}</span>
												<span className={styles.state}>{symbolState(symbol, frame.closed)}</span>
											</div>
										);
									})}
								</div>
							)}
						</div>
					))
				)}

				<div className={styles.logSection}>
					<span className={styles.frameLabel}>histórico de resoluções</span>
					{log.length === 0 ? (
						<p className={styles.emptyFrame}>nenhuma variável foi lida ainda</p>
					) : (
						<div className={styles.logList}>
							{log.map((entry) => {
								const isCurrent = entry.index === currentStepIndex;
								return (
									<div
										key={entry.index}
										ref={isCurrent ? currentLogRef : undefined}
										className={isCurrent ? `${styles.logRow} ${styles.logRowCurrent}` : styles.logRow}
									>
										"{entry.name}" →{" "}
										{entry.depth === 0 ? "achada no próprio escopo" : `achada ${entry.depth} nível(is) acima`}
										{entry.targetSymbolId === null && " (variável global ou de fora do escopo local)"}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
