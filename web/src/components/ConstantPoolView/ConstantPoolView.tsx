import styles from "./ConstantPoolView.module.css";

interface ConstantPoolViewProps {
	constants: string[];
}

export function ConstantPoolView({ constants }: Readonly<ConstantPoolViewProps>) {
	return (
		<div className={styles.table}>
			<div className={styles.tableHeader}>
				<span>índice</span>
				<span>valor</span>
			</div>
			{constants.map((value, index) => (
				<div key={`${index}-${value}`} className={styles.row}>
					<span className={styles.index}>{index}</span>
					<span className={styles.value}>{value}</span>
				</div>
			))}
		</div>
	);
}
