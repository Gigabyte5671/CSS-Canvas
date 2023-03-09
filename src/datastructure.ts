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
