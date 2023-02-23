import { ref } from 'vue';
import CSS from 'css';
import type { Stylesheet } from 'css';
import expand from 'emmet';

class HTMLGenerator {
	static instance: HTMLGenerator;
	input = ref('');
	output = ref('');
	error = ref(false);
	#shadowDomElements = [] as HTMLElement[];

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
		this.#updateShadowDom(this.output.value, css);
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

		stylesheet.stylesheet?.rules.forEach((rule, index) => {
			let textContent = '';
			let otherProps = [] as string[];
			// @ts-expect-error: 'declarations' does exist on 'rule'.
			rule.declarations.forEach((declaration) => {
				if (declaration.property === 'inner-text') {
					textContent = declaration.value;
					return;
				}
				if (declaration.property === 'src') {
					otherProps.push(`[src="${declaration.value}"]`);
					return;
				}
				if (declaration.property === 'href') {
					otherProps.push(`[href="${declaration.value}"]`);
					return;
				}
			});
			// @ts-expect-error: 'selectors' does exist on 'rule'.
			let condensedSelectors = rule.selectors.map((selector: string) => {
				return selector.split(' ').reduce((previousSegment, currentSegment) => {
					if (
						previousSegment.lastIndexOf('>') >= previousSegment.length - 1
						|| currentSegment.charAt(0) === '>'
					) {
						return previousSegment + currentSegment;
					}
					return previousSegment + '>' + currentSegment;
				});
			}) as string[];
			if (condensedSelectors.length > 1) {
				return;
			}
			condensedSelectors.forEach((selector) => {
				if (selector.charAt(selector.length - 1) === '>') {
					selector = selector.slice(0, selector.length - 1);
				}
				emmetString += `${index > 0 ? '+' : ''}${selector}${otherProps.join('')}{${textContent}}`;
			});
		});

		try {
			parserOutput = expand(emmetString);
		} catch (e) {
			console.warn('Emmet Error:', e);
		}

		return parserOutput;
	}

	#createBox (options: {
		sizing: string,
		width: string,
		height: string,
		paddingTop: string,
		paddingRight: string,
		paddingBottom: string,
		paddingLeft: string,
		borderTop: string,
		borderRight: string,
		borderBottom: string,
		borderLeft: string,
		marginTop: string,
		marginRight: string,
		marginBottom: string,
		marginLeft: string,
		fontSize?: string,
		fontFamily?: string,
		textContent?: string
	}): string {
		options.width = options.sizing === 'border-box' ? `calc(${options.width} - (${options.paddingLeft || '0px'} + ${options.paddingRight || '0px'}));` : options.width;
		options.height = options.sizing === 'border-box' ? `calc(${options.height} - (${options.paddingTop || '0px'} + ${options.paddingBottom || '0px'}));` : options.height;

		return `<div
					class="CSSCanvasBoxModelMargin"
					style="
						padding-top: ${options.marginTop};
						padding-right: ${options.marginRight};
						padding-bottom: ${options.marginBottom};
						padding-left: ${options.marginLeft};
						font-family: ${options.fontFamily || 'inherit'};
						font-size: ${options.fontSize || 'inherit'};
					"
				>
					<div
						class="CSSCanvasBoxModelPadding"
						style="
							padding-top: ${options.paddingTop};
							padding-right: ${options.paddingRight};
							padding-bottom: ${options.paddingBottom};
							padding-left: ${options.paddingLeft};
							border-top-width: ${options.borderTop};
							border-right-width: ${options.borderRight};
							border-bottom-width: ${options.borderBottom};
							border-left-width: ${options.borderLeft};
						"
					>
						<div
							class="CSSCanvasBoxModelContent"
							style="
								width: ${options.width};
								height: ${options.height};
							"
						>
							${options.textContent ?? ''}
						</div>
					</div>
				</div>`;
	}

	computeBoxModel (css: string): string {
		let boxModelOutput = '';
		let stylesheet = {} as Stylesheet;

		try {
			stylesheet = CSS.parse(css);
		} catch (e) {
			console.warn('CSS Error:', e);
		}

		stylesheet.stylesheet?.rules.forEach((rule) => {
			let declarations = {
				sizing: 'border-box',
				width: '',
				height: '',
				paddingTop: '',
				paddingRight: '',
				paddingBottom: '',
				paddingLeft: '',
				borderTop: '',
				borderRight: '',
				borderBottom: '',
				borderLeft: '',
				marginTop: '',
				marginRight: '',
				marginBottom: '',
				marginLeft: '',
				fontSize: '',
				fontFamily: '',
				textContent: ''
			};

			// @ts-expect-error: 'declarations' does exist on 'rule'.
			rule.declarations.forEach(({ property, value }: { property: string, value: string } ) => {
				if (property === 'inner-text') {
					declarations.textContent = value;
				}
				else if (property === 'width') {
					declarations.width = value;
				}
				else if (property === 'height') {
					declarations.height = value;
				}
				else if (property === 'margin') {
					const marginParts = value?.split(' ') ?? [];
					switch (marginParts.length) {
						case 1:
							declarations.marginTop = value;
							declarations.marginRight = value;
							declarations.marginBottom = value;
							declarations.marginLeft = value;
							break;
					
						case 2:
							declarations.marginTop = marginParts[0];
							declarations.marginRight = marginParts[1];
							declarations.marginBottom = marginParts[0];
							declarations.marginLeft = marginParts[1];
							break;
					
						case 3:
							declarations.marginTop = marginParts[0];
							declarations.marginRight = marginParts[1];
							declarations.marginBottom = marginParts[2];
							declarations.marginLeft = marginParts[1];
							break;
					
						case 4:
							declarations.marginTop = marginParts[0];
							declarations.marginRight = marginParts[1];
							declarations.marginBottom = marginParts[2];
							declarations.marginLeft = marginParts[3];
							break;
					
						default:
							declarations.marginTop = '0';
							declarations.marginRight = '0';
							declarations.marginBottom = '0';
							declarations.marginLeft = '0';
							break;
					}
				}
				else if (property === 'margin-top') {
					declarations.marginTop = value;
				}
				else if (property === 'margin-right') {
					declarations.marginRight = value;
				}
				else if (property === 'margin-bottom') {
					declarations.marginBottom = value;
				}
				else if (property === 'margin-left') {
					declarations.marginLeft = value;
				}
				else if (property === 'padding') {
					const paddingParts = value?.split(' ') ?? [];
					switch (paddingParts.length) {
						case 1:
							declarations.paddingTop = value;
							declarations.paddingRight = value;
							declarations.paddingBottom = value;
							declarations.paddingLeft = value;
							break;
					
						case 2:
							declarations.paddingTop = paddingParts[0];
							declarations.paddingRight = paddingParts[1];
							declarations.paddingBottom = paddingParts[0];
							declarations.paddingLeft = paddingParts[1];
							break;
					
						case 3:
							declarations.paddingTop = paddingParts[0];
							declarations.paddingRight = paddingParts[1];
							declarations.paddingBottom = paddingParts[2];
							declarations.paddingLeft = paddingParts[1];
							break;
					
						case 4:
							declarations.paddingTop = paddingParts[0];
							declarations.paddingRight = paddingParts[1];
							declarations.paddingBottom = paddingParts[2];
							declarations.paddingLeft = paddingParts[3];
							break;
					
						default:
							declarations.paddingTop = '0';
							declarations.paddingRight = '0';
							declarations.paddingBottom = '0';
							declarations.paddingLeft = '0';
							break;
					}
				}
				else if (property === 'padding-top') {
					declarations.paddingTop = value;
				}
				else if (property === 'padding-right') {
					declarations.paddingRight = value;
				}
				else if (property === 'padding-bottom') {
					declarations.paddingBottom = value;
				}
				else if (property === 'padding-left') {
					declarations.paddingLeft = value;
				}
				else if (property === 'border-width') {
					const borderParts = value?.split(' ') ?? [];
					switch (borderParts.length) {
						case 1:
							declarations.borderTop = value;
							declarations.borderRight = value;
							declarations.borderBottom = value;
							declarations.borderLeft = value;
							break;
					
						case 2:
							declarations.borderTop = borderParts[0];
							declarations.borderRight = borderParts[1];
							declarations.borderBottom = borderParts[0];
							declarations.borderLeft = borderParts[1];
							break;
					
						case 3:
							declarations.borderTop = borderParts[0];
							declarations.borderRight = borderParts[1];
							declarations.borderBottom = borderParts[2];
							declarations.borderLeft = borderParts[1];
							break;
					
						case 4:
							declarations.borderTop = borderParts[0];
							declarations.borderRight = borderParts[1];
							declarations.borderBottom = borderParts[2];
							declarations.borderLeft = borderParts[3];
							break;
					
						default:
							declarations.borderTop = '0';
							declarations.borderRight = '0';
							declarations.borderBottom = '0';
							declarations.borderLeft = '0';
							break;
					}
				}
				else if (property === 'border-top-width') {
					declarations.borderTop = value;
				}
				else if (property === 'border-right-width') {
					declarations.borderRight = value;
				}
				else if (property === 'border-bottom-width') {
					declarations.borderBottom = value;
				}
				else if (property === 'border-left-width') {
					declarations.borderLeft = value;
				}
			});

			boxModelOutput += this.#createBox(declarations);
		});

		return boxModelOutput;
	}

	get boxModel (): string {
		return this.computeBoxModel(this.input.value);
	}

	applyShadowDom (element: HTMLElement): void {
		element.attachShadow({ mode: "open" });
		this.#shadowDomElements.push(element);
		this.#updateShadowDom(this.output.value, this.input.value);
	}

	#updateShadowDom (html: string, css: string): void {
		this.#shadowDomElements.forEach((element) => {
			const shadow = element.shadowRoot;
			if (!shadow) {
				return;
			}
			const stylesheet = new CSSStyleSheet();
			stylesheet.replaceSync(css);
			shadow.adoptedStyleSheets = [stylesheet];
			shadow.innerHTML = html;
		});
	}

	clear (): void {
		this.set('');
	}
}

export default HTMLGenerator;
