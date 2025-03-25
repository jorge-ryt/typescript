export interface IUser {
	id: string;
	email: string;
	password: string;
}

export interface HTMLElementWithDataset extends HTMLElement {
	dataset: DOMStringMap;
}