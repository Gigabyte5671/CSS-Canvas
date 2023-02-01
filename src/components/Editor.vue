<script lang="ts">
import { defineComponent } from 'vue';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
// @ts-expect-error: Prism has no types.
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles
export default defineComponent({
	name: 'Editor',
	components: {
		PrismEditor
	},
	methods: {
		highlighter (code: string) {
			return highlight(code, languages.css);
		}
	}
});
</script>

<template>
	<div class="editorContainer">
		<PrismEditor
			class="editor"
			line-numbers
			:highlight="highlighter"
		/>
	</div>
</template>

<style>
.editorContainer {
	display: flex;
	width: 100%;
	height: 100%;
	background-color: var(--color-background);
}
.editor {
	color: #ccc;

	/* you must provide font-family font-size line-height. Example: */
	font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
	font-size: 14px;
	line-height: 1.5;
	padding: 5px;
}
.editor:focus-within {
	background: #222;
}
.prism-editor__container {
	height: 100%;
}
.prism-editor__textarea:focus {
	outline: none;
}
</style>
