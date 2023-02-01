import { ref } from 'vue';
import CSS from 'css';
import type { Stylesheet } from 'css';

class HTMLGenerator {
	static instance: HTMLGenerator;
	input = ref('');
	output = ref('');
	error = ref(false);

	constructor () {}

	static getInstance (): HTMLGenerator {
		if (!HTMLGenerator.instance) {
			HTMLGenerator.instance = new HTMLGenerator();
		}
		return HTMLGenerator.instance;
	}

	set (css: string): void {
		this.input.value = css;
		this.output.value = this.parse(css);
	}

	parse (css: string): string {
		let parserOutput = '';
		let stylesheet = {} as Stylesheet;

		try {
			stylesheet = CSS.parse(css);
			console.log(stylesheet);
		} catch (e) {
			console.warn(e);
		}

		stylesheet.stylesheet?.rules.forEach((rule) => {
			let declarations = '';
			// @ts-expect-error: 'declarations' does exist on 'rule'.
			rule.declarations.forEach((declaration) => {
				declarations += `${declaration.property}: ${declaration.value};`;
			});
			// @ts-expect-error: 'selectors' does exist on 'rule'.
			parserOutput += `<${rule.selectors} style="${declarations}"></${rule.selectors}>`;
		});

		return parserOutput;
	}
}

export default HTMLGenerator;
