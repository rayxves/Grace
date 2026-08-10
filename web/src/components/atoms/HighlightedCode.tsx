import { useMemo } from "react";
import { HIGHLIGHT_COLOR_VAR, highlightSource } from "../../lib/highlightSource";

interface HighlightedCodeProps {
	code: string;
	className?: string;
}

export function HighlightedCode({ code, className }: Readonly<HighlightedCodeProps>) {
	const lines = useMemo(() => highlightSource(code), [code]);

	return (
		<pre className={className}>
			<code>
				{lines.map((tokens, lineIndex) => (
					<span key={lineIndex}>
						{tokens.map((token, tokenIndex) => (
							<span key={tokenIndex} style={{ color: HIGHLIGHT_COLOR_VAR[token.kind] }}>
								{token.text}
							</span>
						))}
						{lineIndex < lines.length - 1 && "\n"}
					</span>
				))}
			</code>
		</pre>
	);
}
