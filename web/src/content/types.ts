export type ExpectedResult =
	| { kind: "output"; lines: string[] }
	| { kind: "error" };

export interface VerifiedExample {
	id: string;
	title: string;
	code: string;
	expect: ExpectedResult;
}

export interface ReferenciaItem {
	id: string;
	titulo: string;
	sintaxe?: string;
	descricao: string;
	exemplo?: VerifiedExample;
	aviso?: string;
	erroDemonstrado?: VerifiedExample;
}

export interface ReferenciaSecao {
	id: string;
	titulo: string;
	intro?: string;
	itens: ReferenciaItem[];
}
