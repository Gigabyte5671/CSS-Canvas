export default class PersistentStorage {
	static #enabled = true;

	static #keys = {
		editorInput: 'CSSCanvasInput',
		title: 'CSSCanvasProjectTitle',
		colorMode: 'CSSCanvasProjectColorMode',
		projectHasBeenSaved: 'CSSCanvasProjectSaved'
	};

	constructor () {}

	static get input (): string {
		return window.localStorage.getItem(this.#keys.editorInput) ?? '';
	}

	static set input (value: string) {
		if (!this.#enabled) {
			return;
		}
		window.localStorage.setItem(this.#keys.editorInput, value);
		this.projectSaved = false;
	}

	static get title (): string {
		return window.localStorage.getItem(this.#keys.title) ?? 'Untitled';
	}

	static set title (value: string) {
		if (!this.#enabled) {
			return;
		}
		window.localStorage.setItem(this.#keys.title, value);
		this.projectSaved = false;
	}

	static get colorMode (): boolean {
		return Boolean(window.localStorage.getItem(this.#keys.colorMode));
	}

	static set colorMode (value: boolean) {
		if (!this.#enabled) {
			return;
		}
		if (value) {
			window.localStorage.setItem(this.#keys.colorMode, 'true');
		} else {
			window.localStorage.removeItem(this.#keys.colorMode);
		}
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

	static enable (): void {
		this.#enabled = true;
	}

	static disable (): void {
		this.#enabled = false;
	}

	static clear (): void {
		window.localStorage.clear();
	}
}
