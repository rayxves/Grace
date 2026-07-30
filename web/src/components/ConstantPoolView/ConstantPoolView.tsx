import styles from "./ConstantPoolView.module.css";

interface ConstantPoolViewProps {
	constants: string[];
}

export function ConstantPoolView({ constants }: Readonly<ConstantPoolViewProps>) {
	return (
		<section className={styles.panel}>
			<h2 className={styles.title}>tabela de constantes</h2>
			<p className={styles.hint}>
				Valores literais e nomes de variáveis globais que o compilador guardou à parte —
				a instrução "constante" referencia um deles pelo índice.
			</p>
			<div className={styles.content}>
				{constants.length > 0 ? (
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
				) : (
					<p className={styles.placeholder}>Execute um programa para ver as constantes geradas</p>
				)}
			</div>
		</section>
	);
}
