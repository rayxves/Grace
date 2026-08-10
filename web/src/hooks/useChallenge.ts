import { useContext } from "react";
import { ChallengeContext, type ChallengeContextValue } from "./challengeContext";

export function useChallenge(): ChallengeContextValue {
	const ctx = useContext(ChallengeContext);
	if (!ctx) throw new Error("useChallenge deve ser usado dentro de ChallengeProvider");
	return ctx;
}
