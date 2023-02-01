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
			panelRatio: {
				min: 0.2,
				max: 1.8,
				value: 1
			},
			resizing: false,
			colorMode: false
		};
	},
	computed: {
		editorWidth (): string {
			const width = 50 * this.panelRatio.value;
			return `${width}%`;
		},
		canvasWidth (): string {
			const width = 100 - 50 * this.panelRatio.value;
			return `${width}%`;
		}
	},
	methods: {
		startResize (): void {
			this.resizing = true;
		},
		resize (position: number, target: EventTarget | null): void {
			if (this.resizing && target) {
				const t = target as HTMLElement;
				let mainElement = t as HTMLElement | null;
				while (mainElement && mainElement?.tagName?.toLowerCase() !== 'main') {
					mainElement = mainElement.parentElement;
				}
				if (mainElement && 'clientWidth' in mainElement) {
					const ratio = position / (mainElement.clientWidth / 2);
					this.panelRatio.value = ratio < this.panelRatio.min ? this.panelRatio.min :
											ratio > this.panelRatio.max ? this.panelRatio.max :
											ratio;
				}
			}
		},
		endResize (): void {
			this.resizing = false;
		}
	}
});
</script>

<template>
		<button
			:title="colorMode ? 'Change canvas to dark mode' : 'Change canvas to light mode'"
			@click="colorMode = !colorMode"
		>
	<main
		@mousemove="resize($event.x, $event.target)"
		@mouseleave="endResize()"
		@mouseup="endResize()"
	>
		<Editor
			:style="{ width: editorWidth }"
		/>
		<div
			class="resizer"
			@mousedown="startResize()"
			@dblclick="panelRatio.value = 1"
		>
			<span class="hitbox"></span>
		</div>
		<CSSCanvas
			:style="{ width: canvasWidth }"
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

.resizer {
	z-index: 2;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 2px;
	min-width: 2px;
	height: 100%;
	background-color: var(--color-border);
	transition: 0.1s ease background-color;
	cursor: e-resize;
}
.resizer:hover {
	background-color: var(--color-text);
}
.resizer > .hitbox {
	position: absolute;
	display: block;
	width: calc(100% + 16px);
	height: 100%;
}
.resizer::before {
	content: '';
	position: absolute;
	display: block;
	width: 100%;
	height: 100%;
	background-color: inherit;
	transition: 0.1s ease width;
}
.resizer:hover::before {
	width: calc(100% + 6px);
}
.resizer::after {
	content: '';
	position: absolute;
	display: block;
	width: 100%;
	height: 3rem;
	background-color: var(--color-background);
	border-radius: 10px;
	opacity: 0;
	transition: 0.1s ease opacity;
}
.resizer:hover::after {
	opacity: 1;
}
</style>
