import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Play, Search } from "lucide-react";
import { Braces, GitBranch, Repeat, SquareFunction, Recycle, Box } from "lucide-react";
import { galeria } from "../content/galeria";
import { exercicios } from "../content/exercicios";
import { conserte } from "../content/conserte";
import type { Exercicio, Topic, VerifiedExample } from "../content/types";
import { useRoute } from "../hooks/useRoute";
import { ExercicioRunner } from "../components/ExercicioRunner/ExercicioRunner";
import styles from "./Praticar.module.css";

const TOPIC_ICONS: Record<string, typeof Braces> = {
	variaveis: Braces,
	condicionais: GitBranch,
	lacos: Repeat,
	funcoes: SquareFunction,
	recursao: Recycle,
	classes: Box,
};

type Mode = "galeria" | "exercicios" | "consertar";

const MODES: { id: Mode; label: string }[] = [
	{ id: "galeria", label: "Galeria" },
	{ id: "exercicios", label: "Exercícios" },
	{ id: "consertar", label: "Consertar" },
];

interface SearchHit {
	topic: Topic;
	example: VerifiedExample;
}

function searchGaleria(query: string): SearchHit[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return [];
	const hits: SearchHit[] = [];
	for (const topic of galeria) {
		for (const example of topic.examples) {
			const haystack = `${topic.title} ${example.title} ${example.code}`.toLowerCase();
			if (haystack.includes(needle)) {
				hits.push({ topic, example });
			}
		}
	}
	return hits;
}

function ExampleCard({ example, onExperimentar }: Readonly<{
	example: VerifiedExample;
	onExperimentar: (code: string) => void;
}>) {
	return (
		<article className={styles.card}>
			<h3 className={styles.cardTitle}>{example.title}</h3>
			<pre className={styles.code}>{example.code}</pre>
			<button
				type="button"
				className={styles.experimentar}
				onClick={() => onExperimentar(example.code)}
			>
				<Play size="1rem" />
				experimentar
			</button>
		</article>
	);
}

function GaleriaSection({ query }: Readonly<{ query: string }>) {
	const { navigate } = useRoute();
	const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

	const searchHits = useMemo(() => searchGaleria(query), [query]);
	const selectedTopic = galeria.find((topic) => topic.id === selectedTopicId) ?? null;
	const experimentar = (code: string) => navigate("visualizador", null, code);

	if (query.trim()) {
		return (
			<div className={styles.grid}>
				{searchHits.length > 0 ? (
					searchHits.map(({ topic, example }) => (
						<div key={`${topic.id}/${example.id}`} className={styles.hitGroup}>
							<span className={styles.hitTopic}>{topic.title}</span>
							<ExampleCard example={example} onExperimentar={experimentar} />
						</div>
					))
				) : (
					<p className={styles.empty}>Nenhum exemplo encontrado para "{query}".</p>
				)}
			</div>
		);
	}

	if (selectedTopic) {
		return (
			<>
				<button
					type="button"
					className={styles.backButton}
					onClick={() => setSelectedTopicId(null)}
				>
					<ArrowLeft size="1rem" />
					todos os tópicos
				</button>
				<h2 className={styles.topicTitle}>{selectedTopic.title}</h2>
				<div className={styles.grid}>
					{selectedTopic.examples.map((example) => (
						<ExampleCard key={example.id} example={example} onExperimentar={experimentar} />
					))}
				</div>
			</>
		);
	}

	return (
		<div className={styles.topicGrid}>
			{galeria.map((topic) => {
				const Icon = TOPIC_ICONS[topic.id] ?? Braces;
				return (
					<button
						key={topic.id}
						type="button"
						className={styles.topicCard}
						onClick={() => setSelectedTopicId(topic.id)}
					>
						<Icon size="1.5rem" />
						<span className={styles.topicCardTitle}>{topic.title}</span>
						<span className={styles.topicCardDescription}>{topic.description}</span>
					</button>
				);
			})}
		</div>
	);
}

function ExerciciosSection({ items }: Readonly<{ items: Exercicio[] }>) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selected = items.find((item) => item.id === selectedId) ?? null;

	if (selected) {
		return (
			<>
				<button
					type="button"
					className={styles.backButton}
					onClick={() => setSelectedId(null)}
				>
					<ArrowLeft size="1rem" />
					todos os exercícios
				</button>
				<article className={styles.exercicioDetail}>
					<h2 className={styles.topicTitle}>{selected.titulo}</h2>
					<p className={styles.enunciado}>{selected.enunciado}</p>
					<ExercicioRunner
						key={selected.id}
						codigoInicial={selected.codigoInicial}
						saidaEsperada={selected.saidaEsperada}
					/>
				</article>
			</>
		);
	}

	return (
		<div className={styles.topicGrid}>
			{items.map((item) => (
				<button
					key={item.id}
					type="button"
					className={styles.topicCard}
					onClick={() => setSelectedId(item.id)}
				>
					<span className={styles.topicCardTitle}>{item.titulo}</span>
					<span className={styles.topicCardDescription}>{item.enunciado}</span>
				</button>
			))}
		</div>
	);
}

export function Praticar() {
	const [mode, setMode] = useState<Mode>("galeria");
	const [query, setQuery] = useState("");

	let content: ReactNode;
	if (mode === "galeria") {
		content = <GaleriaSection query={query} />;
	} else if (mode === "exercicios") {
		content = <ExerciciosSection items={exercicios} />;
	} else {
		content = <ExerciciosSection items={conserte} />;
	}

	const selectMode = (next: Mode) => {
		setMode(next);
		setQuery("");
	};

	return (
		<div className={styles.screen}>
			<header className={styles.header}>
				<h1 className={styles.title}>Praticar</h1>
				<p className={styles.subtitle}>
					Uma galeria de programas, exercícios com correção automática, e programas
					quebrados para consertar.
				</p>
				<div className={styles.modeTabs}>
					{MODES.map((item) => (
						<button
							key={item.id}
							type="button"
							className={
								mode === item.id ? `${styles.modeTab} ${styles.modeTabActive}` : styles.modeTab
							}
							onClick={() => selectMode(item.id)}
						>
							{item.label}
						</button>
					))}
				</div>
				{mode === "galeria" && (
					<div className={styles.searchBox}>
						<Search size="1rem" className={styles.searchIcon} />
						<input
							type="search"
							className={styles.searchInput}
							placeholder="buscar por tópico, título ou código…"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
					</div>
				)}
			</header>
			{content}
		</div>
	);
}
