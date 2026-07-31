import { Panel } from "../Panel/Panel";
import styles from "./ConstantPoolView.module.css";

interface ConstantPoolViewProps {
	constants: string[];
}

export function ConstantPoolView({ constants }: Readonly<ConstantPoolViewProps>) {
	return (
		<Panel
			title="tabela de constantes"
			caption='Valores literais e nomes de variáveis globais que o compilador guardou à parte — a instrução "constante" referencia um deles pelo índice.'
			captionClassName={styles.hint}
			isEmpty={constants.length === 0}
			placeholder="Execute um programa para ver as constantes geradas"
		>
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
		</Panel>
	);
}
