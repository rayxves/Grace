import type { TokenInfo } from "../../types";
import { Panel } from "../Panel/Panel";
import { TokenChip } from "../atoms/TokenChip";
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
			contentClassName={styles.list}
			isEmpty={tokens.length === 0}
			emptyClassName={styles.empty}
			placeholder="Execute um programa para ver os tokens gerados"
			placeholderClassName={styles.placeholder}
		>
			{visibleTokens.map((token, i) => (
				<TokenChip
					key={`${i}-${token.line}-${token.text}`}
					text={token.text || token.kind}
					title={`linha ${token.line} · ${token.kind}`}
					active={token.line === hoveredLine}
					onMouseEnter={() => onHoverLine(token.line)}
					onMouseLeave={() => onHoverLine(null)}
				/>
			))}
		</Panel>
	);
}
