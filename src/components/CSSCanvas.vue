<script setup lang="ts">
import HTMLGenerator from '../htmlGenerator';
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'CSSCanvas',
	props: {
		mode: { type: Boolean, required: false }
	},
	data() {
		return {
			panelRatio: {
				min: 0.2,
				max: 1.8,
				default: 1.25,
				value: 1.25
			},
			resizing: false,
			zoom: {
				min: 0.2,
				max: 5.0,
				difference: 0.2,
				value: 1.0
			}
		}
	},
	computed: {
		canvasHeight (): string {
			const height = 50 * this.panelRatio.value;
			return `${height}%`;
		},
		boxModelHeight (): string {
			const height = 100 - 50 * this.panelRatio.value;
			return `${height}%`;
		},
		zoomScale (): string {
			return `scale(${this.zoom.value * 100}%)`;
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
				const navRectangle = document.querySelector('nav')?.getBoundingClientRect();
				if (navRectangle && mainElement && 'clientHeight' in mainElement) {
					const ratio = (position - navRectangle.height) / (mainElement.clientHeight / 2);
					this.panelRatio.value = ratio < this.panelRatio.min ? this.panelRatio.min :
											ratio > this.panelRatio.max ? this.panelRatio.max :
											ratio;
				}
			}
		},
		endResize (): void {
			this.resizing = false;
		},
		zoomIn (): void {
			this.zoom.value += this.zoom.difference;
			if (this.zoom.value > this.zoom.max) {
				this.zoom.value = this.zoom.max;
			}
		},
		zoomOut (): void {
			this.zoom.value -= this.zoom.difference;
			if (this.zoom.value < this.zoom.min) {
				this.zoom.value = this.zoom.min;
			}
		}
	},
	mounted() {
		HTMLGenerator.getInstance().applyShadowDom(this.$refs['mainOutput'] as HTMLOutputElement);
	}
});
</script>

<template>
	<div
		class="cssCanvas"
		:style="{
			color: mode ? `var(--color-background)` : `var(--color-text)`,
			backgroundColor: mode ? `var(--color-text)` : `var(--color-background)`
		}"
		@mousemove="resize($event.y, $event.target)"
		@touchmove="resize($event.touches[0].clientY, $event.target)"
		@mouseleave="endResize()"
		@touchend="endResize()"
		@mouseup="endResize()"
		@touchcancel="endResize()"
	>
		<div
			ref="mainOutput"
			class="output"
			:style="{
				height: canvasHeight,
				transform: zoomScale
			}"
		></div>
		<div
			class="resizer"
			@mousedown="startResize()"
			@touchstart="startResize()"
			@dblclick="panelRatio.value = panelRatio.default"
		>
			<span class="hitbox"></span>
		</div>
		<output
			:style="{
				height: boxModelHeight,
				transform: zoomScale
			}"
			v-html="HTMLGenerator.getInstance().boxModel"
		></output>
		<div
			class="zoomControls"
			:style="{ bottom: `calc(${boxModelHeight} - 2ch)` }"
		>
			<button title="Zoom out" @click="zoomOut()">
				<span class="material-symbols-rounded">remove</span>
			</button>
			<button title="Zoom in" @click="zoomIn()">
				<span class="material-symbols-rounded">add</span>
			</button>
			<output>{{ (zoom.value * 100).toFixed(0) }}%</output>
		</div>
		<div class="boxModelKey">
			<p><span style="background: #87b2bc;"></span>&nbsp;&nbsp;Content</p>
			<p><span style="background: #b7c47f;"></span>&nbsp;&nbsp;Padding</p>
			<p><span style="background: #e3c381;"></span>&nbsp;&nbsp;Border</p>
			<p><span style="background: #ad8052;"></span>&nbsp;&nbsp;Margin</p>
		</div>
	</div>
</template>

<style scoped>
.cssCanvas {
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	background-color: var(--color-background);
	transition: 0.2s ease background-color;
	overflow: hidden;
	user-select: none;
}
.cssCanvas > output,
.cssCanvas > .output {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.resizer {
	z-index: 2;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 2px;
	min-height: 2px;
	background-color: var(--color-border);
	transition: 0.1s ease background-color;
	cursor: n-resize;
}
.resizer:hover {
	background-color: currentColor;
}
.resizer > .hitbox {
	position: absolute;
	display: block;
	width: 100%;
	height: calc(100% + 16px);
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
	height: calc(100% + 6px);
}
.resizer::after {
	content: '';
	position: absolute;
	display: block;
	width: 3rem;
	height: 100%;
	background-color: var(--color-background);
	border-radius: 10px;
	opacity: 0;
	transition: 0.1s ease opacity;
}
.resizer:hover::after {
	opacity: 1;
}

.zoomControls {
	position: absolute;
	right: 1.5ch;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1.2rem;
	place-items: center;
	gap: 2px;
	background-color: var(--color-border);
	border-radius: 5px;
	transform: translateY(100%);
}
.zoomControls > output {
	grid-area: 2 / 1 / 3 / 3;
	margin-top: -0.4em;
	font-size: small;
}

.boxModelKey {
	position: absolute;
	z-index: 1;
	bottom: 0;
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	align-items: center;
	gap: 1ch 5ch;
	width: 100%;
	padding: 1ch 2ch 2ch;
	font-size: 0.8rem;
	background-color: inherit;
}
.boxModelKey p {
	margin: 0;
	white-space: nowrap;
}
.boxModelKey p span {
	display: inline-block;
	width: 1em;
	height: 1em;
	border: 1px solid var(--color-border);
	transform: translateY(0.1em);
}
</style>

<style>
@import url('../css/boxModel.css');
</style>
