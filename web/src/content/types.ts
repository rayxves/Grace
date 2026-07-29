export type ExpectedResult =
	| { kind: "output"; lines: string[] }
	| { kind: "error" };

export interface VerifiedExample {
	id: string;
	title: string;
	code: string;
	expect: ExpectedResult;
}

export interface Topic {
	id: string;
	title: string;
	description: string;
	examples: VerifiedExample[];
}

export interface Exercicio {
	id: string;
	titulo: string;
	enunciado: string;
	codigoInicial: string;
	saidaEsperada: string[];
}

export interface Licao {
	id: string;
	numero: number;
	titulo: string;
	sintaxe: string;
	conceito: string[];
	exemplo: VerifiedExample;
	aviso?: string;
	erroDemonstrado?: VerifiedExample;
	desafio?: string;
}
