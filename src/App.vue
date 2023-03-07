<script lang="ts">
import { defineComponent } from 'vue';
import HTMLGenerator from './htmlGenerator';
import PersistentStorage from './persistentStorage';
import JSZip from 'jszip';
import LZString from 'lz-string';
import Editor from './components/Editor.vue';
import CSSCanvas from './components/CSSCanvas.vue';
import HelpMenu from './components/HelpMenu.vue';
import LoginMenu from './components/LoginMenu.vue';
import RegisterMenu from './components/RegisterMenu.vue';

export default defineComponent({
	name: 'App',
	components: {
		Editor,
		CSSCanvas,
		HelpMenu,
		LoginMenu,
		RegisterMenu
	},
	data() {
		return {
			panelRatio: {
				min: 0.2,
				max: 1.8,
				default: 1,
				value: 1
			},
			resizing: false,
			colorMode: false,
			showHelp: false,
			showLogin: false,
			showRegister: false,
			shareLinkCopied: false,
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
		},
		projectTitle: {
			get (): string {
				return PersistentStorage.title;
			},
			set (value: string) {
				PersistentStorage.title = value;
			}
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
		},
		createNewProject (): void {
			let confirmation = true;
			if (
				HTMLGenerator.input.value.length > 0
				&& !PersistentStorage.projectSaved
			) {
				confirmation = window.confirm('You have unsaved changes. Are you sure you want to create a new project?');
			}
			if (confirmation) {
				HTMLGenerator.clear();
				PersistentStorage.input = '';
				PersistentStorage.title = 'Untitled';
				this.$forceUpdate();
			}
		},
		async saveOutput (): Promise<void> {
			// Create the output files.
			const cssFile = new File([HTMLGenerator.input.value], 'index.css', { type: 'text/css' });
			const htmlFile = new File([HTMLGenerator.output.value], 'index.html', { type: 'text/html' });

			// Create zip file.
			const zip = new JSZip();
			zip.file(`${PersistentStorage.title}.css`, cssFile);
			zip.file(`${PersistentStorage.title}.html`, htmlFile);
			const zipFile = await zip.generateAsync({ type: 'blob' })

			// Create download link.
			var anchor = document.createElement('a');
			anchor.href = URL.createObjectURL(zipFile);
			anchor.download = `${PersistentStorage.title}.zip`;

			// Initiate the download.
			anchor.click();

			// Update the state.
			PersistentStorage.projectSaved = true;
		},
		share (): void {
			const compressedCSS = LZString.compressToBase64(HTMLGenerator.input.value);
			navigator.clipboard.writeText(`https://gigabyte5671.github.io/CSS-Canvas/?css=${compressedCSS}`);
			this.shareLinkCopied = true;
			window.setTimeout(() => {
				this.shareLinkCopied = false;
			}, 2000);
		},
		logout (): void {
			signOut(FirebaseHandler.auth).then(() => {
				// Logout successful.
			}).catch((error) => {
				console.warn('Auth logout failed:', error);
			});
		}
	},
	mounted() {
		window.addEventListener('keydown', (event) => {
			if (event.code === 'Escape') {
				this.showHelp = false;
			}
		});

		// Check if a share link exists in the url.
		const search = window.location.search;
		if (/^\?input=/i.test(search)) {
			PersistentStorage.projectSaved = true;
			PersistentStorage.disable();
			HTMLGenerator.set(LZString.decompressFromBase64(search.split('?css=')[1]) ?? '');
		}
	}
});
</script>

<template>
	<nav>
		<img class="logo" src="./assets/logo-small.webp" alt="CSS Canvas logo" title="CSS Canvas">
		<input type="text" class="projectTitle" v-model="projectTitle">
		<button title="New" @click="createNewProject()">
			<span class="material-symbols-rounded">add_box</span>
		</button>
		<button title="Save" @click="saveOutput()">
			<span class="material-symbols-rounded">save</span>
		</button>
		<Transition>
			<button v-if="shareLinkCopied" title="Link copied to clipboard" @click.stop="">
				<span class="material-symbols-rounded">done</span>
			</button>
			<button v-else title="Share" @click="share()">
				<span class="material-symbols-rounded">share</span>
			</button>
		</Transition>
		<button
			title="Help"
			@click="showHelp = true"
		>
			<span class="material-symbols-rounded">question_mark</span>
		</button>
		<button
			:title="colorMode ? 'Change canvas to dark mode' : 'Change canvas to light mode'"
			@click="colorMode = !colorMode"
		>
			<span class="material-symbols-rounded">{{ colorMode ? 'dark_mode' : 'light_mode' }}</span>
		</button>
		<button
			v-if="FirebaseHandler.user.value"
			title="Logout"
			@click="logout()"
		>
			<span class="material-symbols-rounded">logout</span>
		</button>
		<button
			v-else
			title="Login"
			@click="showLogin = true"
		>
			<span class="material-symbols-rounded">login</span>
		</button>
	</nav>
	<main
		@mousemove="resize($event.x, $event.target)"
		@touchmove="resize($event.touches[0].clientX, $event.target)"
		@mouseleave="endResize()"
		@touchend="endResize()"
		@mouseup="endResize()"
		@touchcancel="endResize()"
	>
		<Editor
			:style="{ width: editorWidth }"
		/>
		<div
			class="resizer"
			@mousedown="startResize()"
			@touchstart="startResize()"
			@dblclick="panelRatio.value = panelRatio.default"
		>
			<span class="hitbox"></span>
		</div>
		<CSSCanvas
			:style="{ width: canvasWidth }"
			:mode="colorMode"
		/>
	</main>
	<HelpMenu v-model="showHelp" />
	<LoginMenu v-model="showLogin" @signup="showRegister = true" @success="" />
	<RegisterMenu v-model="showRegister" @login="showLogin = true" />
</template>

<style scoped>
nav {
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	align-items: center;
	gap: 1ch;
	padding: 0.7ch 1ch;
	border-bottom: 1px solid var(--color-border);
}
nav .logo {
	display: block;
	width: 2rem;
	height: 2rem;
	margin-right: 1ch;
}
nav .projectTitle {
	padding: 0.2em 0.75ch;
	font-size: 1rem;
	border-radius: 5px;
}
@media only screen and (max-width: 510px) {
	nav .projectTitle {
		max-width: 15ch;
	}
}
@media only screen and (max-width: 440px) {
	nav .projectTitle {
		max-width: 10ch;
	}
}
@media only screen and (max-width: 390px) {
	nav .projectTitle {
		display: none;
	}
}
nav > *:last-child {
	margin-left: auto;
}


main {
	display: flex;
	flex-flow: row nowrap;
	user-select: none;
}

.resizer {
	z-index: 3;
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

<style>
.v-enter-active,
.v-leave-active {
	transition: 0.2s ease opacity;
}

.v-enter-active {
	position: absolute;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
