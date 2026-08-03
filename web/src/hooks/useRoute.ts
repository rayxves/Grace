import { useContext } from "react";
import { RouteContext, type RouteContextValue } from "./routeContext";

export function useRoute(): RouteContextValue {
	const ctx = useContext(RouteContext);
	if (!ctx) throw new Error("useRoute deve ser usado dentro de RouteProvider");
	return ctx;
}
