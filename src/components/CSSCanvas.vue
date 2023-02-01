<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'CSSCanvas',
});
</script>

<template>
	<output
		class="cssCanvas"
	>
	</output>
</template>

<style scoped>
.cssCanvas {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	background-color: var(--color-background);
	transition: 0.2s ease background-color;
}
</style>
