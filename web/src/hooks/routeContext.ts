import { createContext } from "react";
import { decodeProgram, encodeProgram } from "../lib/urlProgram";

export type Screen = "visualizer" | "reference" | "about";

export interface Route {
	screen: Screen;
	param: string | null;
}

export interface RouteContextValue {
	route: Route;
	program: string;
	setProgram: (source: string) => void;
	navigate: (screen: Screen, param?: string | null, program?: string) => void;
}

export const VALID_SCREENS: Screen[] = ["visualizer", "reference", "about"];

export const DEFAULT_SOURCE = `var x = 10;
imprima(x + 5);

var contador = 0;
enquanto (contador < 3) {
	imprima(contador);
	contador = contador + 1;
}
`;

export const REPLACE_DEBOUNCE_MS = 400;

export function parseHash(hash: string): { route: Route; program: string | null } {
	const raw = hash.startsWith("#") ? hash.slice(1) : hash;
	const [pathPart, queryPart] = raw.split("?");
	const segments = pathPart.split("/").filter(Boolean);
	const candidate = segments[0];
	const screen = (VALID_SCREENS as string[]).includes(candidate)
		? (candidate as Screen)
		: "visualizer";
	const param = segments[1] ?? null;

	let program: string | null = null;
	if (queryPart) {
		const p = new URLSearchParams(queryPart).get("p");
		if (p) program = decodeProgram(p);
	}
	return { route: { screen, param }, program };
}

export function buildHash(screen: Screen, param: string | null, program: string | null): string {
	let hash = `#/${screen}`;
	if (param) hash += `/${param}`;
	if (screen === "visualizer" && program !== null) {
		hash += `?p=${encodeProgram(program)}`;
	}
	return hash;
}

export const RouteContext = createContext<RouteContextValue | null>(null);
