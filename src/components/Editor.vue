<script setup lang="ts">
import HTMLGenerator from '../htmlGenerator';
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
// @ts-expect-error: Prism has no types.
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles
import PersistentStorage from '../persistentStorage';

export default defineComponent({
	name: 'Editor',
	components: {
		PrismEditor
	},
	computed: {
		code: {
			get (): string {
				return HTMLGenerator.getInstance().input.value;
			},
			set (value: string) {
				HTMLGenerator.getInstance().set(value);
				this.saveToPersistentStorage(value);
			}
		}
	},
	methods: {
		highlighter (code: string) {
			return highlight(code, languages.css);
		},
		saveToPersistentStorage (value: string): void {
			PersistentStorage.input = value;
		}
	},
	mounted () {
		this.code = PersistentStorage.input;
	}
});
</script>

<template>
	<div class="editorContainer" :class="{ error: HTMLGenerator.getInstance().error.value }">
		<PrismEditor
			class="editor"
			line-numbers
			:tab-size="1"
			:insert-spaces="false"
			:highlight="highlighter"
			v-model="code"
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
.editorContainer.error::after {
	content: 'warning';
	position: absolute;
	top: 0.5ch;
	right: 0.5ch;
	display: block;
	min-width: 1em;
	min-height: 1em;
	color: gold;
	font-family: 'Material Symbols Rounded';
	font-size: 1.2rem;
	font-variation-settings:
		'FILL' 1,
		'wght' 400,
		'GRAD' 0,
		'opsz' 48;
	line-height: 1em;
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
