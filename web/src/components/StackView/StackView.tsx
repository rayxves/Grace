import { AnimatePresence, motion } from "framer-motion";
import type { Step } from "../../types";
import { explainStep } from "../../lib/instructions";
import styles from "./StackView.module.css";

interface StackViewProps {
	step: Step | null;
	previousStep: Step | null;
	output: string[];
	error: string | null;
}

export function StackView({
	step,
	previousStep,
	output,
	error,
}: Readonly<StackViewProps>) {
	const stack = step?.stack ?? [];
	const explanation = step ? explainStep(step, previousStep) : null;

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>pilha de execução</h2>
			<div className={styles.content}>
				<div className={styles.stackArea}>
					<div className={styles.stack}>
						<AnimatePresence initial={false}>
							{stack.map((value, i) => (
								<motion.div
									key={`${i}-${value}`}
									className={
										i === stack.length - 1
											? `${styles.block} ${styles.blockTop}`
											: styles.block
									}
									initial={{ opacity: 0, y: -12, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -12, scale: 0.9 }}
									transition={{ duration: 0.18 }}
									layout>
									{value}
								</motion.div>
							))}
						</AnimatePresence>
						{stack.length === 0 && (
							<p className={styles.emptyStack}>pilha vazia</p>
						)}
					</div>
					<div className={styles.stackBase} />
				</div>

				<div className={styles.detailArea}>
					{step && explanation && (
						<>
							<div className={styles.instructionHeader}>
								<span className={styles.instructionName}>
									{step.instruction}
								</span>
								<span className={styles.instructionLine}>
									linha {step.line}
								</span>
							</div>
							<p className={styles.instructionDescription}>
								{explanation.summary}
							</p>

							{(explanation.popped.length > 0 ||
								explanation.pushed.length > 0) && (
								<div className={styles.diffArea}>
									{explanation.popped.length > 0 && (
										<div className={styles.diffRow}>
											<span className={styles.diffLabel}>saiu da pilha</span>
											{explanation.popped.map((value, i) => (
												<span
													key={`pop-${i}-${value}`}
													className={styles.poppedChip}>
													{value}
												</span>
											))}
										</div>
									)}
									{explanation.pushed.length > 0 && (
										<div className={styles.diffRow}>
											<span className={styles.diffLabel}>entrou na pilha</span>
											{explanation.pushed.map((value, i) => (
												<span
													key={`push-${i}-${value}`}
													className={styles.pushedChip}>
													{value}
												</span>
											))}
										</div>
									)}
								</div>
							)}
						</>
					)}

					{error && (
						<div
							className={styles.errorStop}
							role="alert">
							<strong>
								{step
									? "a execução parou aqui"
									: "o programa nem chegou a executar"}
							</strong>
							<p>{error}</p>
						</div>
					)}

					{step && (
						<div className={styles.output}>
							<span className={styles.outputLabel}>saída do programa</span>
							{output.length > 0 ? (
								output.map((line, i) => (
									<span
										key={`${i}-${line}`}
										className={styles.outputLine}>
										{line}
									</span>
								))
							) : (
								<span className={styles.outputEmpty}>
									Nada foi impresso ainda
								</span>
							)}
						</div>
					)}

					{!step && !error && (
						<div className={styles.empty}>
							<p className={styles.placeholder}>
								Execute um programa para acompanhar a pilha passo a passo
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
