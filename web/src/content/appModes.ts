import type { Mode as AppMode } from "../screens/Visualizer";

export interface AppModeInfo {
	id: AppMode;
	label: string;
	description: string;
}

export const APP_MODES: AppModeInfo[] = [
	{
		id: "full",
		label: "modo completo",
		description:
			"Modo completo mostra tudo que a implementação expõe: bytecode, pool de constantes, offsets e a resolução de escopos.",
	},
	{
		id: "stage",
		label: "modo palco",
		description:
			"Modo palco esconde pool de constantes, offsets e resolução de escopos, e mostra só código, instrução atual e pilha. É uma versão simplificada, não incorreta: tudo que ele mostra continua valendo no modo completo.",
	},
];
