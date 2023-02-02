import { ref } from 'vue';
import CSS from 'css';
import type { Stylesheet } from 'css';
import expand from 'emmet';

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
		let emmetString = '';
		let stylesheet = {} as Stylesheet;

		try {
			stylesheet = CSS.parse(css);
		} catch (e) {
			console.warn('CSS Error:', e);
		}

		stylesheet.stylesheet?.rules.forEach((rule) => {
			let declarations = '';
			let textContent = '';
			// @ts-expect-error: 'declarations' does exist on 'rule'.
			rule.declarations.forEach((declaration) => {
				if (declaration.property === 'inner-text') {
					textContent = declaration.value;
					return;
				}
				declarations += `${declaration.property}:${declaration.value};`;
			});
			// @ts-expect-error: 'selectors' does exist on 'rule'.
			console.log(rule.selectors);
			// @ts-expect-error: 'selectors' does exist on 'rule'.
			console.log(rule.selectors.join('').split(' ').join('>'));
			// @ts-expect-error: 'selectors' does exist on 'rule'.
			emmetString += `${rule.selectors.join('').split(' ').join('>')}[style="${declarations}"]{${textContent}}`;
		});

		try {
			parserOutput = expand(emmetString);
		} catch (e) {
			console.warn('Emmet Error:', e);
		}

		return parserOutput;
	}
}

export default HTMLGenerator;
