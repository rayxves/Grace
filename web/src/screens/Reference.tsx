import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Play, Search } from "lucide-react";
import { reference } from "../content/reference";
import type { ReferenceItem } from "../content/types";
import { useRoute } from "../hooks/useRoute";
import styles from "./Reference.module.css";

interface SearchHit {
	sectionTitle: string;
	item: ReferenceItem;
}

function search(query: string): SearchHit[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return [];
	const hits: SearchHit[] = [];
	for (const section of reference) {
		for (const item of section.items) {
			const haystack = `${item.title} ${item.description} ${item.syntax ?? ""}`.toLowerCase();
			if (haystack.includes(needle)) {
				hits.push({ sectionTitle: section.title, item });
			}
		}
	}
	return hits;
}

function ItemEntry({ item }: Readonly<{ item: ReferenceItem }>) {
	const { navigate } = useRoute();
	const paragraphs = item.description.split("\n\n");
	return (
		<article className={styles.entry} id={item.id}>
			<h3 className={styles.entryTitle}>{item.title}</h3>

			{item.syntax && (
				<div className={styles.syntaxBlock}>
					<span className={styles.blockLabel}>Sintaxe</span>
					<code className={styles.syntaxCode}>{item.syntax}</code>
				</div>
			)}

			<div className={styles.description}>
				{paragraphs.map((paragraph) => (
					<p key={paragraph}>{paragraph}</p>
				))}
			</div>

			{item.whyItExists && (
				<div className={styles.rationaleBlock}>
					<span className={styles.blockLabel}>Por que existe</span>
					<p>{item.whyItExists}</p>
				</div>
			)}

			{item.withoutIt && (
				<div className={styles.rationaleBlock}>
					<span className={styles.blockLabel}>Sem isso</span>
					<p>{item.withoutIt}</p>
				</div>
			)}

			{item.example && (
				<div className={styles.exampleBlock}>
					<span className={styles.blockLabel}>Exemplo</span>
					<div className={styles.exampleContent}>
						<pre className={styles.code}>{item.example.code}</pre>
						<button
							type="button"
							className={styles.tryButton}
							onClick={() => navigate("visualizer", null, item.example!.code)}
						>
							<Play size="1rem" />
							{item.example.expect.kind === "error" ? "ver o erro no visualizador" : "experimentar"}
						</button>
					</div>
				</div>
			)}

			{item.warning && (
				<div className={styles.warning}>
					<AlertTriangle size="1.125rem" className={styles.warningIcon} />
					<p className={styles.warningText}>{item.warning}</p>
				</div>
			)}

			{item.demonstratedError && (
				<div className={styles.exampleBlock}>
					<span className={styles.blockLabel}>{item.demonstratedError.title}</span>
					<div className={styles.exampleContent}>
						<pre className={styles.code}>{item.demonstratedError.code}</pre>
						<button
							type="button"
							className={styles.tryButton}
							onClick={() => navigate("visualizer", null, item.demonstratedError!.code)}
						>
							<Play size="1rem" />
							ver o erro no visualizador
						</button>
					</div>
				</div>
			)}
		</article>
	);
}

export function Reference() {
	const { route } = useRoute();
	const [selectedId, setSelectedId] = useState(reference[0].id);
	const [query, setQuery] = useState("");
	const [appliedParam, setAppliedParam] = useState<string | null>(null);

	if (route.param && route.param !== appliedParam) {
		const [sectionId] = route.param.split(".");
		if (reference.some((s) => s.id === sectionId)) {
			setSelectedId(sectionId);
			setQuery("");
		}
		setAppliedParam(route.param);
	}

	useEffect(() => {
		if (!route.param) return;
		const [, itemId] = route.param.split(".");
		if (!itemId) return;
		requestAnimationFrame(() => {
			document.getElementById(itemId)?.scrollIntoView({ block: "start" });
		});
	}, [route.param]);

	const hits = useMemo(() => search(query), [query]);
	const section = reference.find((s) => s.id === selectedId) ?? reference[0];

	return (
		<div className={styles.screen}>
			<nav className={styles.sidebar} aria-label="seções da referência">
				<div className={styles.searchBox}>
					<Search size="0.9375rem" className={styles.searchIcon} />
					<input
						type="search"
						className={styles.searchInput}
						placeholder="buscar…"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
				</div>
				{reference.map((s) => (
					<button
						key={s.id}
						type="button"
						className={
							!query.trim() && s.id === selectedId
								? `${styles.navItem} ${styles.navItemActive}`
								: styles.navItem
						}
						onClick={() => {
							setSelectedId(s.id);
							setQuery("");
						}}
					>
						{s.title}
					</button>
				))}
			</nav>

			<div className={styles.content}>
				{query.trim() ? (
					<>
						<h1 className={styles.sectionTitle}>Resultados para "{query}"</h1>
						<div className={styles.list}>
							{hits.length > 0 ? (
								hits.map(({ sectionTitle, item }) => (
									<div key={item.id}>
										<span className={styles.hitSection}>{sectionTitle}</span>
										<ItemEntry item={item} />
									</div>
								))
							) : (
								<p className={styles.empty}>Nada encontrado.</p>
							)}
						</div>
					</>
				) : (
					<>
						<h1 className={styles.sectionTitle}>{section.title}</h1>
						{section.intro?.split("\n\n").map((paragraph) => (
							<p key={paragraph} className={styles.sectionIntro}>
								{paragraph}
							</p>
						))}
						<div className={styles.list}>
							{section.items.map((item) => (
								<ItemEntry key={item.id} item={item} />
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
