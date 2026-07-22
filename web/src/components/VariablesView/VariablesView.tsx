import { AnimatePresence, motion } from "framer-motion";
import type { Step, Variable } from "../../types";
import { changedVariableNames } from "../../lib/variables";
import styles from "./VariablesView.module.css";

interface VariablesViewProps {
	step: Step | null;
	previousStep: Step | null;
}

interface VariableGroupProps {
	label: string;
	variables: Variable[];
	changed: Set<string>;
	emptyText: string;
}

function VariableGroup({
	label,
	variables,
	changed,
	emptyText,
}: Readonly<VariableGroupProps>) {
	return (
		<div className={styles.section}>
			<span className={styles.sectionLabel}>{label}</span>
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

export function VariablesView({
	step,
	previousStep,
}: Readonly<VariablesViewProps>) {
	if (!step) {
		return (
			<section className={styles.panel}>
				<h2 className={styles.title}>variáveis e chamadas</h2>
				<div className={styles.empty}>
					<p className={styles.placeholder}>
						Execute um programa para acompanhar variáveis e chamadas
					</p>
				</div>
			</section>
		);
	}

	const changedGlobals = changedVariableNames(
		previousStep?.globals ?? [],
		step.globals,
	);
	const changedLocals = changedVariableNames(
		previousStep?.locals ?? [],
		step.locals,
	);

	const maxDepth = step.callStack.length - 1;
	const displayFrames = step.callStack
		.map((frame, depth) => ({ frame, depth }))
		.reverse();

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>variáveis e chamadas</h2>
			<div className={styles.content}>
				{step.loopIteration !== null && (
					<div className={styles.loopBadge}>iteração {step.loopIteration}</div>
				)}

				<div className={styles.section}>
					<span className={styles.sectionLabel}>pilha de chamadas</span>
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
										depth === maxDepth
											? `${styles.frame} ${styles.frameCurrent}`
											: styles.frame
									}
								>
									<span className={styles.frameName}>
										{frame.functionName}
									</span>
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
			</div>
		</section>
	);
}
