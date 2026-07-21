import init, { executar } from "../../../grace/pkg/Grace";
import type { Trace } from "../types";

let initialization: Promise<unknown> | null = null;

function ensureInitialized() {
	if (!initialization) {
		initialization = init();
	}
	return initialization;
}

export async function runGrace(source: string): Promise<Trace> {
	await ensureInitialized();
	return JSON.parse(executar(source)) as Trace;
}
