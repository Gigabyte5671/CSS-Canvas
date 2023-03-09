export interface CSSProject {
	title: string,
	date: number,
	link: string,
	css: string,
	settings: {
		mode: boolean,
		zoom: number,
		ratios: {
			editor: number,
			canvas: number
		}
	}
}

export function generateDefaultProject (): CSSProject {
	return {
		title: 'Untitled',
		date: Date.now(),
		link: '',
		css: '',
		settings: {
			mode: false,
			zoom: 1,
			ratios: {
				editor: 1,
				canvas: 1.25
			}
		}
	};
};
