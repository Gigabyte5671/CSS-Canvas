<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'App',
	components: {
		CSSCanvas
	}
});
</script>

<template>
	<main
	>
		<CSSCanvas
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
