import { reactive } from 'vue';

export default class PersistentStorage {
	private static enabled = true;

	private static keys = {
		editorInput: 'CSSCanvasInput',
		title: 'CSSCanvasProjectTitle',
		colorMode: 'CSSCanvasProjectColorMode',
		projectHasBeenSaved: 'CSSCanvasProjectSaved'
	};

	private static storage = reactive({
		input: window.localStorage.getItem(this.keys.editorInput) ?? '',
		title: window.localStorage.getItem(this.keys.title) ?? 'Untitled',
		colorMode: Boolean(window.localStorage.getItem(this.keys.colorMode)),
		projectSaved: Boolean(window.localStorage.getItem(this.keys.projectHasBeenSaved))
	});

	constructor () {}

	static get input (): string {
		return this.storage.input;
	}

	static set input (value: string) {
		if (!this.enabled) {
			return;
		}
		this.storage.input = value;
		window.localStorage.setItem(this.keys.editorInput, value);
		this.projectSaved = false;
	}

	static get title (): string {
		return this.storage.title;
	}

	static set title (value: string) {
		if (!this.enabled) {
			return;
		}
		this.storage.title = value;
		window.localStorage.setItem(this.keys.title, value);
		this.projectSaved = false;
	}

	static get colorMode (): boolean {
		return this.storage.colorMode;
	}

	static set colorMode (value: boolean) {
		if (!this.enabled) {
			return;
		}
		this.storage.colorMode = value;
		if (value) {
			window.localStorage.setItem(this.keys.colorMode, 'true');
		} else {
			window.localStorage.removeItem(this.keys.colorMode);
		}
		this.projectSaved = false;
	}

	static get projectSaved (): boolean {
		return this.storage.projectSaved;
	}

	static set projectSaved (value: boolean) {
		this.storage.projectSaved = value;
		if (value) {
			window.localStorage.setItem(this.keys.projectHasBeenSaved, 'true');
		} else {
			window.localStorage.removeItem(this.keys.projectHasBeenSaved);
		}
	}

	static enable (): void {
		this.enabled = true;
	}

	static disable (): void {
		this.enabled = false;
	}

	static clear (): void {
		window.localStorage.clear();
	}
}
