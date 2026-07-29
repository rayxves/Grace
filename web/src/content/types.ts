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

export interface ReferenciaItem {
	id: string;
	titulo: string;
	sintaxe?: string;
	descricao: string;
	exemplo?: VerifiedExample;
}

export interface ReferenciaSecao {
	id: string;
	titulo: string;
	intro?: string;
	itens: ReferenciaItem[];
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
