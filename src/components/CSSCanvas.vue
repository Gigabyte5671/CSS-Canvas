<script setup lang="ts">
import HTMLGenerator from '../htmlGenerator';
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'CSSCanvas',
	props: {
		mode: { type: Boolean, required: false }
	}
});
</script>

<template>
	<output
		class="cssCanvas"
		:style="{ backgroundColor: mode ? `var(--color-text)` : `var(--color-background)` }"
		v-html="HTMLGenerator.getInstance().output.value"
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
