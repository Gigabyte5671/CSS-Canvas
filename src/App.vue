<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'App',
	components: {
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
