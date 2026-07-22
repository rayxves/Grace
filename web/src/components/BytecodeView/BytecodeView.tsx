import { useEffect, useMemo, useRef } from "react";
import type { BytecodeInstruction, Step } from "../../types";
import { groupBytecodeByLine } from "../../lib/bytecode";
import styles from "./BytecodeView.module.css";

interface BytecodeViewProps {
	bytecode: BytecodeInstruction[];
	steps: Step[];
	stepIndex: number;
	errorLine: number | null;
}

export function BytecodeView({
	bytecode,
	steps,
	stepIndex,
	errorLine,
}: Readonly<BytecodeViewProps>) {
	const currentRowRef = useRef<HTMLDivElement>(null);

	const currentOffset = steps[stepIndex]?.offset ?? null;

	const highlightOffset = useMemo(() => {
		if (currentOffset !== null) return currentOffset;
		if (errorLine === null) return null;
		return (
			bytecode.find((instruction) => instruction.line === errorLine)
				?.offset ?? null
		);
	}, [currentOffset, errorLine, bytecode]);

	const executedOffsets = useMemo(() => {
		const offsets = new Set<number>();
		for (let i = 0; i <= stepIndex && i < steps.length; i++) {
			offsets.add(steps[i].offset);
		}
		return offsets;
	}, [steps, stepIndex]);

	const groups = useMemo(() => groupBytecodeByLine(bytecode), [bytecode]);

	useEffect(() => {
		currentRowRef.current?.scrollIntoView({
			block: "nearest",
			behavior: "smooth",
		});
	}, [highlightOffset]);

	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>bytecode</h2>
			<div className={styles.list}>
				{bytecode.length > 0 ? (
					groups.map((group) => (
						<div
							key={`${group.line}-${group.instructions[0].offset}`}
							className={styles.lineGroup}
						>
							<span className={styles.lineLabel}>linha {group.line}</span>
							<div className={styles.lineInstructions}>
								{group.instructions.map((instruction) => {
									const isCurrent = instruction.offset === highlightOffset;
									const isError = isCurrent && errorLine !== null;
									const isExecuted =
										!isCurrent && executedOffsets.has(instruction.offset);
									const rowClass = [
										styles.row,
										isError
											? styles.rowError
											: isCurrent
												? styles.rowCurrent
												: "",
										isExecuted ? styles.rowExecuted : "",
									].join(" ");

									return (
										<div
											key={instruction.offset}
											ref={isCurrent ? currentRowRef : undefined}
											className={rowClass}
										>
											<span className={styles.offset}>
												{String(instruction.offset).padStart(4, "0")}
											</span>
											<span className={styles.text}>{instruction.text}</span>
										</div>
									);
								})}
							</div>
						</div>
					))
				) : (
					<div className={styles.emptyState}>
						<p className={styles.placeholder}>
							execute um programa para ver o bytecode gerado
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
