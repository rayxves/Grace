import { useCallback, useState, type ReactNode } from "react";
import type { Challenge } from "../content/challenges";
import { ChallengeContext } from "./challengeContext";

export function ChallengeProvider({ children }: Readonly<{ children: ReactNode }>) {
	const [active, setActive] = useState<Challenge | null>(null);
	const [revealed, setRevealed] = useState(false);
	const [canReveal, setCanReveal] = useState(false);

	const start = useCallback((challenge: Challenge) => {
		setActive(challenge);
		setRevealed(false);
		setCanReveal(false);
	}, []);

	const reveal = useCallback(() => setRevealed(true), []);

	const dismiss = useCallback(() => {
		setActive(null);
		setRevealed(false);
		setCanReveal(false);
	}, []);

	const markAdvanced = useCallback(() => setCanReveal(true), []);

	return (
		<ChallengeContext.Provider value={{ active, revealed, canReveal, start, reveal, dismiss, markAdvanced }}>
			{children}
		</ChallengeContext.Provider>
	);
}
