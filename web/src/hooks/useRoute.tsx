import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { decodeProgram, encodeProgram } from "../lib/urlProgram";

export type Screen = "visualizador" | "aprender" | "praticar" | "referencia";

export interface Route {
	screen: Screen;
	param: string | null;
}

const VALID_SCREENS: Screen[] = ["visualizador", "aprender", "praticar", "referencia"];

const DEFAULT_SOURCE = `var x = 10;
imprima(x + 5);

var contador = 0;
enquanto (contador < 3) {
	imprima(contador);
	contador = contador + 1;
}
`;

const REPLACE_DEBOUNCE_MS = 400;

function parseHash(hash: string): { route: Route; program: string | null } {
	const raw = hash.startsWith("#") ? hash.slice(1) : hash;
	const [pathPart, queryPart] = raw.split("?");
	const segments = pathPart.split("/").filter(Boolean);
	const candidate = segments[0];
	const screen = (VALID_SCREENS as string[]).includes(candidate)
		? (candidate as Screen)
		: "visualizador";
	const param = segments[1] ?? null;

	let program: string | null = null;
	if (queryPart) {
		const p = new URLSearchParams(queryPart).get("p");
		if (p) program = decodeProgram(p);
	}
	return { route: { screen, param }, program };
}

function buildHash(screen: Screen, param: string | null, program: string | null): string {
	let hash = `#/${screen}`;
	if (param) hash += `/${param}`;
	if (screen === "visualizador" && program !== null) {
		hash += `?p=${encodeProgram(program)}`;
	}
	return hash;
}

interface RouteContextValue {
	route: Route;
	program: string;
	setProgram: (source: string) => void;
	navigate: (screen: Screen, param?: string | null, program?: string) => void;
}

const RouteContext = createContext<RouteContextValue | null>(null);

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
			if (current.screen !== "visualizador") return;
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

export function useRoute(): RouteContextValue {
	const ctx = useContext(RouteContext);
	if (!ctx) throw new Error("useRoute deve ser usado dentro de RouteProvider");
	return ctx;
}
