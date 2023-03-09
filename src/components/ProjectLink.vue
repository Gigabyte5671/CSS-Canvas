<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'ProjectLink',
	props: {
		title: { type: String, required: true },
		date: { type: Number, required: true },
		loading: { type: Boolean, required: false },
		selected: { type: Boolean, required: false }
	},
	emits: ['delete'],
	computed: {
		dateString (): string {
			return new Date(this.date).toDateString();
		}
	}
});
</script>

<template>
	<button class="projectLink" :class="{ loading, selected }">
		<p>{{ title }}</p>
		<p>{{ dateString }}</p>
		<button title="Delete" @click.stop="$emit('delete')">
			<span class="material-symbols-rounded">delete_forever</span>
		</button>
	</button>
</template>

<style scoped>
.projectLink {
	display: grid;
	grid-template-columns: 1fr min-content;
	grid-template-rows: auto auto;
	justify-content: flex-start;
	align-items: flex-start;
	width: 100%;
	padding: 0.25em 1ch 0.4em;
	font-size: 1rem;
	transition: 0.1s ease background-color, 0.1s ease border-color, 0.1s ease opacity;
	cursor: pointer;
	user-select: none;
}
.projectLink.selected {
	border-color: var(--color-primary-light);
}
.projectLink.loading {
	opacity: 0.5;
	pointer-events: none;
}

.projectLink > p {
	margin: 0;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}
.projectLink > p:last-of-type {
	font-size: smaller;
	opacity: 0.5;
}

.projectLink > button {
	grid-area: 1 / 2 / 3 / 3;
	align-self: center;
	opacity: 0.3;
	transition: 0.1s ease background-color, 0.1s ease opacity;
}
.projectLink:hover > button {
	opacity: 1;
}
</style>
