import type { TokenInfo } from "../../types";
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
	return (
		<section className={styles.panel} data-role="tokens-panel">
			<h2 className={styles.title}>tokens</h2>
			{tokens.length > 0 && (
				<p className={styles.caption}>
					o primeiro passo do compilador é picar o texto em pedaços — cada peça é um token
				</p>
			)}
			<div className={styles.list}>
				{tokens.length > 0 ? (
					tokens
						.filter((token) => token.kind !== "EOF")
						.map((token, i) => (
							<span
								key={`${i}-${token.line}-${token.text}`}
								className={
									token.line === hoveredLine
										? `${styles.token} ${styles.tokenHovered}`
										: styles.token
								}
								onMouseEnter={() => onHoverLine(token.line)}
								onMouseLeave={() => onHoverLine(null)}
								title={`linha ${token.line} · ${token.kind}`}
							>
								{token.text || token.kind}
							</span>
						))
				) : (
					<p className={styles.placeholder}>
						execute um programa para ver os tokens gerados
					</p>
				)}
			</div>
		</section>
	);
}
