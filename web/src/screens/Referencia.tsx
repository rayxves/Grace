import { useMemo, useState } from "react";
import { Play, Search } from "lucide-react";
import { referencia } from "../content/referencia";
import type { ReferenciaItem } from "../content/types";
import { useRoute } from "../hooks/useRoute";
import styles from "./Referencia.module.css";

interface SearchHit {
	secaoTitulo: string;
	item: ReferenciaItem;
}

function search(query: string): SearchHit[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return [];
	const hits: SearchHit[] = [];
	for (const secao of referencia) {
		for (const item of secao.itens) {
			const haystack = `${item.titulo} ${item.descricao} ${item.sintaxe ?? ""}`.toLowerCase();
			if (haystack.includes(needle)) {
				hits.push({ secaoTitulo: secao.titulo, item });
			}
		}
	}
	return hits;
}

function ItemCard({ item }: Readonly<{ item: ReferenciaItem }>) {
	const { navigate } = useRoute();
	return (
		<article className={styles.card}>
			<div className={styles.cardHeader}>
				<h3 className={styles.cardTitle}>{item.titulo}</h3>
				{item.sintaxe && <code className={styles.cardSintaxe}>{item.sintaxe}</code>}
			</div>
			<p className={styles.cardDescricao}>{item.descricao}</p>
			{item.exemplo && (
				<>
					<pre className={styles.code}>{item.exemplo.code}</pre>
					<button
						type="button"
						className={styles.experimentar}
						onClick={() => navigate("visualizador", null, item.exemplo!.code)}
					>
						<Play size="1rem" />
						{item.exemplo.expect.kind === "error" ? "ver o erro no visualizador" : "experimentar"}
					</button>
				</>
			)}
		</article>
	);
}

export function Referencia() {
	const [selectedId, setSelectedId] = useState(referencia[0].id);
	const [query, setQuery] = useState("");

	const hits = useMemo(() => search(query), [query]);
	const secao = referencia.find((s) => s.id === selectedId) ?? referencia[0];

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
				{referencia.map((s) => (
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
						{s.titulo}
					</button>
				))}
			</nav>

			<div className={styles.content}>
				{query.trim() ? (
					<>
						<h1 className={styles.secaoTitulo}>Resultados para "{query}"</h1>
						<div className={styles.grid}>
							{hits.length > 0 ? (
								hits.map(({ secaoTitulo, item }) => (
									<div key={item.id} className={styles.hitGroup}>
										<span className={styles.hitSecao}>{secaoTitulo}</span>
										<ItemCard item={item} />
									</div>
								))
							) : (
								<p className={styles.empty}>Nada encontrado.</p>
							)}
						</div>
					</>
				) : (
					<>
						<h1 className={styles.secaoTitulo}>{secao.titulo}</h1>
						{secao.intro && <p className={styles.secaoIntro}>{secao.intro}</p>}
						<div className={styles.grid}>
							{secao.itens.map((item) => (
								<ItemCard key={item.id} item={item} />
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
