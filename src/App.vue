<script lang="ts">
import { defineComponent } from 'vue';
import Editor from './components/Editor.vue';
import CSSCanvas from './components/CSSCanvas.vue';

export default defineComponent({
	name: 'App',
	components: {
		Editor,
		CSSCanvas
	},
	data() {
		return {
			colorMode: false
		};
	}
});
</script>

<template>
		<button
			:title="colorMode ? 'Change canvas to dark mode' : 'Change canvas to light mode'"
			@click="colorMode = !colorMode"
		>
	<main
	>
		<Editor
		/>
		<CSSCanvas
			:mode="colorMode"
		/>
	</main>
</template>

<style scoped>
}

main {
	display: flex;
	flex-flow: row nowrap;
	user-select: none;
}
</style>
