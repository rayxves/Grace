import type { Mode as AppMode } from "../screens/Visualizer";

export interface AppModeInfo {
	id: AppMode;
	label: string;
	caption: string;
	description: string;
}

export const APP_MODES: AppModeInfo[] = [
	{
		id: "full",
		label: "modo completo",
		caption: "mostra tudo",
		description:
			"Modo completo mostra tudo que a implementação expõe: bytecode, pool de constantes, offsets e a resolução de escopos.",
	},
	{
		id: "stage",
		label: "modo palco",
		caption: "esconde pool, offsets e escopos — simplificado, não incorreto",
		description:
			"Modo palco esconde pool de constantes, offsets e resolução de escopos, e mostra só código, instrução atual e pilha. É uma versão simplificada, não incorreta: tudo que ele mostra continua valendo no modo completo.",
	},
];
