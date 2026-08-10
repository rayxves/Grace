import { createContext } from "react";
import type { Challenge } from "../content/challenges";

export interface ChallengeContextValue {
	active: Challenge | null;
	revealed: boolean;
	canReveal: boolean;
	start: (challenge: Challenge) => void;
	reveal: () => void;
	dismiss: () => void;
	markAdvanced: () => void;
}

export const ChallengeContext = createContext<ChallengeContextValue | null>(null);
