import { useMemo, useState, type CSSProperties } from "react";
import { Rows3, Type, WrapText } from "lucide-react";
import type { TokenCategory, TokenInfo } from "../../types";
import { TOKEN_CATEGORY_COLOR_VAR, TOKEN_CATEGORY_LABELS, TOKEN_CATEGORY_ORDER } from "../../lib/tokenCategory";
import { Panel } from "../Panel/Panel";
import { TokenChip } from "../atoms/TokenChip";
import styles from "./TokensView.module.css";

interface TokensViewProps {
	tokens: TokenInfo[];
	hoveredLine: number | null;
	onHoverLine: (line: number | null) => void;
	run: () => void;
	running: boolean;
}

export function TokensView({
	tokens,
	hoveredLine,
	onHoverLine,
	run,
	running,
}: Readonly<TokensViewProps>) {
	const visibleTokens = useMemo(() => tokens.filter((token) => token.kind !== "EOF"), [tokens]);
	const [activeCategory, setActiveCategory] = useState<TokenCategory | null>(null);
	const [hoveredToken, setHoveredToken] = useState<TokenInfo | null>(null);
	const [grouped, setGrouped] = useState(false);

	const counts = useMemo(() => {
		const map = new Map<TokenCategory, number>();
		for (const token of visibleTokens) {
			map.set(token.category, (map.get(token.category) ?? 0) + 1);
		}
		return map;
	}, [visibleTokens]);

	const groupedByLine = useMemo(() => {
		const map = new Map<number, TokenInfo[]>();
		for (const token of visibleTokens) {
			const list = map.get(token.line) ?? [];
			list.push(token);
			map.set(token.line, list);
		}
		return [...map.entries()].sort((a, b) => a[0] - b[0]);
	}, [visibleTokens]);

	const toggleCategory = (category: TokenCategory) => {
		setActiveCategory((prev) => (prev === category ? null : category));
	};

	const hoverToken = (token: TokenInfo) => {
		onHoverLine(token.line);
		setHoveredToken(token);
	};

	const unhoverToken = () => {
		onHoverLine(null);
		setHoveredToken(null);
	};

	const renderChip = (token: TokenInfo, key: string) => (
		<TokenChip
			key={key}
			text={token.text || token.kind}
			color={TOKEN_CATEGORY_COLOR_VAR[token.category]}
			active={token.line === hoveredLine}
			dimmed={activeCategory !== null && token.category !== activeCategory}
			onMouseEnter={() => hoverToken(token)}
			onMouseLeave={unhoverToken}
		/>
	);

	return (
		<Panel
			title="tokens"
			dataRole="tokens-panel"
			titleClassName={styles.title}
			contentClassName={styles.list}
			isEmpty={visibleTokens.length === 0}
			emptyIcon={<Type size="1.5rem" />}
			placeholder="Os tokens do seu programa aparecem aqui"
			emptyActionLabel="executar"
			onEmptyAction={run}
			emptyActionDisabled={running}
		>
			<div className={styles.toolbar}>
				<div className={styles.categoryStrip}>
					{TOKEN_CATEGORY_ORDER.filter((category) => counts.has(category)).map((category) => (
						<button
							key={category}
							type="button"
							className={
								activeCategory === category
									? `${styles.categoryChip} ${styles.categoryChipActive}`
									: styles.categoryChip
							}
							style={{ "--chip-color": TOKEN_CATEGORY_COLOR_VAR[category] } as CSSProperties}
							onClick={() => toggleCategory(category)}
						>
							{TOKEN_CATEGORY_LABELS[category]} {counts.get(category)}
						</button>
					))}
				</div>
				<div className={styles.viewToggle}>
					<button
						type="button"
						className={!grouped ? `${styles.toggleButton} ${styles.toggleButtonActive}` : styles.toggleButton}
						onClick={() => setGrouped(false)}
						title="fluxo"
						aria-label="ver tokens em fluxo"
						aria-pressed={!grouped}
					>
						<WrapText size="0.9375rem" />
					</button>
					<button
						type="button"
						className={grouped ? `${styles.toggleButton} ${styles.toggleButtonActive}` : styles.toggleButton}
						onClick={() => setGrouped(true)}
						title="agrupado por linha"
						aria-label="ver tokens agrupados por linha"
						aria-pressed={grouped}
					>
						<Rows3 size="0.9375rem" />
					</button>
				</div>
			</div>

			{grouped ? (
				<div className={styles.groupedArea}>
					{groupedByLine.map(([line, lineTokens]) => (
						<div key={line} className={styles.lineRow}>
							<span className={styles.lineNumber}>{line}</span>
							<div className={styles.lineTokens}>
								{lineTokens.map((token, i) => renderChip(token, `${line}-${i}-${token.text}`))}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className={styles.flowArea}>
					{visibleTokens.map((token, i) => renderChip(token, `${i}-${token.line}-${token.text}`))}
				</div>
			)}

			<div className={styles.detailBar}>
				{hoveredToken ? (
					<span>
						{hoveredToken.text || hoveredToken.kind} · {TOKEN_CATEGORY_LABELS[hoveredToken.category]} ·
						linha {hoveredToken.line}
					</span>
				) : (
					<span className={styles.detailPlaceholder}>passe o mouse sobre um token para ver os detalhes</span>
				)}
			</div>
		</Panel>
	);
}
