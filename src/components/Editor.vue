<script setup lang="ts">
// @ts-expect-error: Prism has no types.
import { highlight, languages } from 'prismjs/components/prism-core';
import HTMLGenerator from '../htmlGenerator';
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

export default defineComponent({
	name: 'Editor',
	props: {
		css: { type: String, required: true, default: '' }
	},
	emits: ['update:css'],
	components: {
		PrismEditor
	},
	computed: {
		code: {
			get (): string {
				return this.css;
			},
			set (value: string) {
				this.$emit('update:css', value);
			}
		}
	},
	mounted() {
		HTMLGenerator.set(this.code);
	}
});
</script>

<template>
	<div class="editorContainer" :class="{ error: HTMLGenerator.error.value }">
		<label for="cssEditor" class="visuallyHidden">CSS Editor</label>
		<PrismEditor
			name="cssEditor"
			class="editor"
			line-numbers
			:tab-size="1"
			:insert-spaces="false"
			:highlight="(code: string) => highlight(code, languages.css)"
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
	min-height: 100%;
}
.prism-editor__textarea:focus {
	outline: none;
}
</style>
