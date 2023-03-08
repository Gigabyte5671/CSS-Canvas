export interface CSSProject {
	id: string,
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
