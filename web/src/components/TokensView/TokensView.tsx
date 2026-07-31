import type { TokenInfo } from "../../types";
import { Panel } from "../Panel/Panel";
import styles from "./TokensView.module.css";

interface TokensViewProps {
	tokens: TokenInfo[];
	hoveredLine: number | null;
	onHoverLine: (line: number | null) => void;
}

export function TokensView({
	tokens,
	hoveredLine,
	onHoverLine,
}: Readonly<TokensViewProps>) {
	const visibleTokens = tokens.filter((token) => token.kind !== "EOF");

	return (
		<Panel
			title="tokens"
			dataRole="tokens-panel"
			titleClassName={styles.title}
			caption={
				tokens.length > 0
					? 'O primeiro passo do compilador é "separar" o texto em pedaços, cada peça é um token'
					: undefined
			}
			contentClassName={styles.list}
			isEmpty={tokens.length === 0}
			emptyClassName={styles.empty}
			placeholder="Execute um programa para ver os tokens gerados"
			placeholderClassName={styles.placeholder}
		>
			{visibleTokens.map((token, i) => (
				<span
					key={`${i}-${token.line}-${token.text}`}
					className={
						token.line === hoveredLine
							? `${styles.token} ${styles.tokenHovered}`
							: styles.token
					}
					onMouseEnter={() => onHoverLine(token.line)}
					onMouseLeave={() => onHoverLine(null)}
					title={`linha ${token.line} · ${token.kind}`}>
					{token.text || token.kind}
				</span>
			))}
		</Panel>
	);
}
