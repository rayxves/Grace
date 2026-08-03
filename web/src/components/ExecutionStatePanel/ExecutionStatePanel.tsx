import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Step, Variable } from "../../types";
import { explainStep } from "../../lib/instructions";
import { changedVariableNames } from "../../lib/variables";
import { Panel } from "../Panel/Panel";
import { StackBlock } from "../atoms/StackBlock";
import styles from "./ExecutionStatePanel.module.css";

interface ExecutionStatePanelProps {
	step: Step | null;
	previousStep: Step | null;
	output: string[];
	error: string | null;
	hasBytecode: boolean;
}

interface VariableGroupProps {
	label: string;
	variables: Variable[];
	changed: Set<string>;
	emptyText: string;
}

function VariableGroup({ label, variables, changed, emptyText }: Readonly<VariableGroupProps>) {
	return (
		<div className={styles.subsection}>
			<span className={styles.subsectionLabel}>{label}</span>
			{variables.length > 0 ? (
				<div className={styles.variableTable}>
					{variables.map((variable) => (
						<div
							key={`${variable.name}-${variable.value}`}
							className={
								changed.has(variable.name)
									? `${styles.variableRow} ${styles.variableChanged}`
									: styles.variableRow
							}
						>
							<span className={styles.variableName}>{variable.name}</span>
							<span className={styles.variableValue}>{variable.value}</span>
						</div>
					))}
				</div>
			) : (
				emptyText && <p className={styles.emptyGroup}>{emptyText}</p>
			)}
		</div>
	);
}

export function ExecutionStatePanel({
	step,
	previousStep,
	output,
	error,
	hasBytecode,
}: Readonly<ExecutionStatePanelProps>) {
	const stack = step?.stack ?? [];
	const explanation = step ? explainStep(step) : null;
	const changedGlobals = changedVariableNames(previousStep?.globals ?? [], step?.globals ?? []);
	const changedLocals = changedVariableNames(previousStep?.locals ?? [], step?.locals ?? []);
	const maxFrameDepth = (step?.callStack.length ?? 0) - 1;
	const displayFrames = (step?.callStack ?? [])
		.map((frame, depth) => ({ frame, depth }))
		.reverse();

	const stackRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const top = stackRef.current?.querySelector("[data-stack-top]");
		top?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [step]);

	return (
		<Panel
			title="estado da execução"
			panelClassName={styles.panel}
			contentClassName={styles.content}
			isEmpty={!step && !error}
			emptyClassName={styles.empty}
			placeholder="Execute um programa para acompanhar pilha, saída e variáveis"
		>
			{(step || error) && (
				<>
					<section className={styles.section}>
						<div className={styles.stackRow}>
							<div className={styles.stackArea}>
								<div className={styles.stack} ref={stackRef}>
									<AnimatePresence initial={false}>
										{stack.map((value, i) => (
											<StackBlock
												key={`${i}-${value}`}
												value={value}
												isTop={i === stack.length - 1}
											/>
										))}
									</AnimatePresence>
									{stack.length === 0 && <p className={styles.emptyHint}>pilha vazia</p>}
								</div>
								<div className={styles.stackBase} />
							</div>
							<div className={styles.stackDetail}>
								{step && explanation && (
									<>
										<div className={styles.instructionHeader}>
											<span className={styles.instructionName}>{step.instruction}</span>
											<span className={styles.instructionLine}>linha {step.line}</span>
										</div>
										<p className={styles.instructionDescription}>{explanation.summary}</p>
										{(explanation.popped.length > 0 || explanation.pushed.length > 0) && (
											<div className={styles.diffArea}>
												{explanation.popped.length > 0 && (
													<div className={styles.diffRow}>
														<span className={styles.diffLabel}>saiu da pilha</span>
														{explanation.popped.map((value, i) => (
															<span key={`pop-${i}-${value}`} className={styles.poppedChip}>
																{value}
															</span>
														))}
													</div>
												)}
												{explanation.pushed.length > 0 && (
													<div className={styles.diffRow}>
														<span className={styles.diffLabel}>entrou na pilha</span>
														{explanation.pushed.map((value, i) => (
															<span key={`push-${i}-${value}`} className={styles.pushedChip}>
																{value}
															</span>
														))}
													</div>
												)}
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</section>

					{(step || error) && (
						<section className={styles.section}>
							<h3 className={styles.sectionTitle}>saída</h3>
							<div className={styles.output}>
								{output.map((line, i) => (
									<span key={`${i}-${line}`} className={styles.outputLine}>
										{line}
									</span>
								))}
								{error && (
									<span className={styles.outputError} role="alert">
										{(() => {
											if (step) return "A execução parou aqui: ";
											if (hasBytecode) return "A execução falhou logo na primeira instrução: ";
											return "o programa não chegou a ser compilado: ";
										})()}
										{error}
									</span>
								)}
								{output.length === 0 && !error && (
									<span className={styles.outputEmpty}>Nada foi impresso ainda</span>
								)}
							</div>
						</section>
					)}

					{step && (
						<section className={styles.section}>
							<h3 className={styles.sectionTitle}>variáveis e chamadas</h3>
							{step.loopIteration !== null && (
								<div className={styles.loopBadge}>iteração {step.loopIteration}</div>
							)}
							<div className={styles.subsection}>
								<span className={styles.subsectionLabel}>pilha de chamadas</span>
								<div className={styles.frames}>
									<AnimatePresence initial={false}>
										{displayFrames.map(({ frame, depth }) => (
											<motion.div
												key={depth}
												layout
												initial={{ opacity: 0, x: -12, scale: 0.95 }}
												animate={{ opacity: 1, x: 0, scale: 1 }}
												exit={{ opacity: 0, x: -12, scale: 0.95 }}
												transition={{ duration: 0.18 }}
												className={
													depth === maxFrameDepth
														? `${styles.frame} ${styles.frameCurrent}`
														: styles.frame
												}
											>
												<span className={styles.frameName}>{frame.functionName}</span>
												{frame.callLine !== null && (
													<span className={styles.frameLine}>
														chamada na linha {frame.callLine}
													</span>
												)}
											</motion.div>
										))}
									</AnimatePresence>
								</div>
							</div>

							<VariableGroup
								label="variáveis globais"
								variables={step.globals}
								changed={changedGlobals}
								emptyText="nenhuma variável global ainda"
							/>

							{step.locals.length > 0 && (
								<VariableGroup
									label="variáveis locais"
									variables={step.locals}
									changed={changedLocals}
									emptyText=""
								/>
							)}
						</section>
					)}
				</>
			)}
		</Panel>
	);
}
