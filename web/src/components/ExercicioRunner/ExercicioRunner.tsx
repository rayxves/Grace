import { useState } from "react";
import { CheckCircle2, Play, XCircle } from "lucide-react";
import { CodeEditor } from "../CodeEditor/CodeEditor";
import { runGrace } from "../../lib/grace";
import { collectOutput } from "../../lib/instructions";
import { useRoute } from "../../hooks/useRoute";
import styles from "./ExercicioRunner.module.css";

interface ExercicioRunnerProps {
	codigoInicial: string;
	saidaEsperada: string[];
}

type Resultado =
	| { status: "acertou" }
	| { status: "errou-execucao"; erro: string }
	| { status: "errou-saida"; obtido: string[] };

export function ExercicioRunner({
	codigoInicial,
	saidaEsperada,
}: Readonly<ExercicioRunnerProps>) {
	const { navigate } = useRoute();
	const [codigo, setCodigo] = useState(codigoInicial);
	const [resultado, setResultado] = useState<Resultado | null>(null);
	const [verificando, setVerificando] = useState(false);

	const verificar = async () => {
		setVerificando(true);
		try {
			const trace = await runGrace(codigo);
			if (trace.error) {
				setResultado({ status: "errou-execucao", erro: trace.error });
				return;
			}
			const obtido = collectOutput(trace.steps, trace.steps.length);
			if (JSON.stringify(obtido) === JSON.stringify(saidaEsperada)) {
				setResultado({ status: "acertou" });
			} else {
				setResultado({ status: "errou-saida", obtido });
			}
		} finally {
			setVerificando(false);
		}
	};

	return (
		<div className={styles.runner}>
			<div className={styles.editorWrapper}>
				<CodeEditor
					value={codigo}
					onChange={(next) => {
						setCodigo(next);
						setResultado(null);
					}}
					currentLine={null}
					errorLine={null}
					hoverLine={null}
				/>
			</div>
			<div className={styles.actions}>
				<button
					type="button"
					className={styles.verificar}
					onClick={verificar}
					disabled={verificando}
				>
					{verificando ? "verificando…" : "verificar"}
				</button>
				<button
					type="button"
					className={styles.abrirVisualizador}
					onClick={() => navigate("visualizador", null, codigo)}
				>
					<Play size="1rem" />
					abrir no visualizador
				</button>
			</div>

			{resultado?.status === "acertou" && (
				<div className={styles.feedbackOk}>
					<CheckCircle2 size="1.125rem" />
					<span>Certinho! A saída bateu com o esperado.</span>
				</div>
			)}

			{resultado?.status === "errou-execucao" && (
				<div className={styles.feedbackErro}>
					<XCircle size="1.125rem" className={styles.feedbackIcon} />
					<p className={styles.feedbackText}>O programa deu um erro: {resultado.erro}</p>
				</div>
			)}

			{resultado?.status === "errou-saida" && (
				<div className={styles.feedbackErro}>
					<XCircle size="1.125rem" className={styles.feedbackIcon} />
					<div>
						<p className={styles.feedbackText}>
							Saiu: {resultado.obtido.length > 0 ? resultado.obtido.join(", ") : "(nada)"}
						</p>
						<p className={styles.feedbackText}>Esperado: {saidaEsperada.join(", ")}</p>
					</div>
				</div>
			)}
		</div>
	);
}
