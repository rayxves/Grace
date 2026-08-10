import { Type } from "lucide-react";
import type { TokenInfo } from "../../types";
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
	const visibleTokens = tokens.filter((token) => token.kind !== "EOF");

	return (
		<Panel
			title="tokens"
			dataRole="tokens-panel"
			titleClassName={styles.title}
			contentClassName={styles.list}
			isEmpty={tokens.length === 0}
			emptyIcon={<Type size="1.5rem" />}
			placeholder="Os tokens do seu programa aparecem aqui"
			emptyActionLabel="executar"
			onEmptyAction={run}
			emptyActionDisabled={running}
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
