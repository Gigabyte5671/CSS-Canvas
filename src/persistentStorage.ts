export default class PersistentStorage {
	static #keys = {
		editorInput: 'CSSCanvasInput',
		title: 'CSSCanvasProjectTitle',
		projectHasBeenSaved: 'CSSCanvasProjectSaved'
	};

	constructor () {}

	static get input (): string {
		return window.localStorage.getItem(this.#keys.editorInput) ?? '';
	}

	static set input (value: string) {
		window.localStorage.setItem(this.#keys.editorInput, value);
		this.projectSaved = false;
	}

	static get title (): string {
		return window.localStorage.getItem(this.#keys.title) ?? 'Untitled';
	}

	static set title (value: string) {
		window.localStorage.setItem(this.#keys.title, value);
		this.projectSaved = false;
	}

	static get projectSaved (): boolean {
		return Boolean(window.localStorage.getItem(this.#keys.projectHasBeenSaved));
	}

	static set projectSaved (value: boolean) {
		if (value) {
			window.localStorage.setItem(this.#keys.projectHasBeenSaved, 'true');
		} else {
			window.localStorage.removeItem(this.#keys.projectHasBeenSaved);
		}
	}
}
