<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'HelpMenu',
	props: {
		modelValue: { type: Boolean, required: true }
	},
	emits: ['update:modelValue'],
	methods: {
		show (): void {
			this.$emit('update:modelValue', true);
		},
		hide (): void {
			this.$emit('update:modelValue', false);
		}
	}
});
</script>

<template>
	<div
		v-if="modelValue"
		class="helpMenu"
		@click="hide()"
	>
		<article @click.stop="">
			<button class="close" @click="hide()"><span class="material-symbols-rounded">close</span></button>
			<h2>Welcome to CSS Canvas</h2>
			<p>⬅️ The window on the left is your input editor. Fill this area with CSS to your heart's content.</p>
			<p>➡️ The window on the right is the canvas. This is where your creations come to life!</p>
			<p>↘️ At the bottom of the canvas is the box-model view. This shows you the invisible positioning components of your creations.</p>
			<p>Any CSS that you write in the editor will automatically be displayed on the canvas; no need to refresh.</p>
			<br>
			<h3>Special properties</h3>
			<p>All CSS features that your browser supports are available to you. However, CSS Canvas also has a few extra properties that enable you to add more content to your creations:</p>
			<ul>
				<li>Start any selector with a bang (<span class="code">!</span>) to prevent it from being rendered as an element.</li>
				<li><span class="code">inner-text</span> Adds text content to the selected element.</li>
				<li><span class="code">src</span> Adds a source attribute to the selected element.</li>
				<li><span class="code">href</span> Adds an href attribute to the selected element.</li>
			</ul>
			<br>
			<p>Have fun!</p>
		</article>
	</div>
</template>

<style scoped>
.helpMenu {
	position: absolute;
	z-index: 10;
	inset: 0;
	display: flex;
	padding: 2rem 1rem;
	background-color: #000a;
	overflow-y: auto;
}
.helpMenu > article {
	max-width: 400px;
	margin: auto;
	padding: 0 3ch 1em;
	background-color: var(--color-background);
	border-radius: 5px;
}
.helpMenu > article > .close {
	position: absolute;
	z-index: 2;
	top: 0.5rem;
	right: 0.5rem;
}
.helpMenu span.code {
	padding: 0.2em 1ch;
	color: black;
	font-family: monospace;
	background-color: #888;
	border-radius: 5px;
}
</style>
