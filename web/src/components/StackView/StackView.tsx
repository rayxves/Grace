import { AnimatePresence } from "framer-motion";
import type { Step } from "../../types";
import { explainStep } from "../../lib/instructions";
import { Panel } from "../Panel/Panel";
import { StackBlock } from "../atoms/StackBlock";
import styles from "./StackView.module.css";

interface StackViewProps {
	step: Step | null;
	output: string[];
	error: string | null;
	hasBytecode: boolean;
	maxStackDepth?: number;
}

export function StackView({
	step,
	output,
	error,
	hasBytecode,
	maxStackDepth = 0,
}: Readonly<StackViewProps>) {
	const stack = step?.stack ?? [];
	const explanation = step ? explainStep(step) : null;

	const title = (
		<>
			pilha de execução
			{maxStackDepth > 0 && (
				<span className={styles.titleHint}> — profundidade máxima: {maxStackDepth}</span>
			)}
		</>
	);

	return (
		<Panel title={title} panelClassName={styles.panel} contentClassName={styles.content}>
			<div className={styles.stackArea}>
				<div className={styles.stack}>
					<AnimatePresence initial={false}>
						{stack.map((value, i) => (
							<StackBlock
								key={`${i}-${value}`}
								value={value}
								isTop={i === stack.length - 1}
							/>
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
							{(() => {
								if (step) return "a execução parou aqui";
								if (hasBytecode)
									return "a execução falhou logo na primeira instrução";
								return "o programa não chegou a ser compilado";
							})()}
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
		</Panel>
	);
}
