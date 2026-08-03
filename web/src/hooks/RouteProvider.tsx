import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
	RouteContext,
	buildHash,
	parseHash,
	DEFAULT_SOURCE,
	REPLACE_DEBOUNCE_MS,
	type Screen,
} from "./routeContext";

export function RouteProvider({ children }: Readonly<{ children: ReactNode }>) {
	const [{ route, program }, setState] = useState(() => {
		const initial = parseHash(window.location.hash);
		return { route: initial.route, program: initial.program ?? DEFAULT_SOURCE };
	});
	const replaceTimeout = useRef<number | undefined>(undefined);

	useEffect(() => {
		const onHashChange = () => {
			const parsed = parseHash(window.location.hash);
			setState((prev) => ({
				route: parsed.route,
				program: parsed.program ?? prev.program,
			}));
		};
		window.addEventListener("hashchange", onHashChange);
		window.addEventListener("popstate", onHashChange);
		return () => {
			window.removeEventListener("hashchange", onHashChange);
			window.removeEventListener("popstate", onHashChange);
			window.clearTimeout(replaceTimeout.current);
		};
	}, []);

	const setProgram = useCallback((next: string) => {
		setState((prev) => ({ ...prev, program: next }));
		window.clearTimeout(replaceTimeout.current);
		replaceTimeout.current = window.setTimeout(() => {
			const current = parseHash(window.location.hash).route;
			if (current.screen !== "visualizer") return;
			window.history.replaceState(null, "", buildHash(current.screen, current.param, next));
		}, REPLACE_DEBOUNCE_MS);
	}, []);

	const navigate = useCallback(
		(screen: Screen, param: string | null = null, nextProgram?: string) => {
			setState((prev) => ({
				route: prev.route,
				program: nextProgram !== undefined ? nextProgram : prev.program,
			}));
			const programForHash = nextProgram ?? program;
			window.location.hash = buildHash(screen, param, programForHash);
		},
		[program],
	);

	return (
		<RouteContext.Provider value={{ route, program, setProgram, navigate }}>
			{children}
		</RouteContext.Provider>
	);
}
