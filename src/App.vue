<script setup lang="ts">
import FirebaseHandler from './firebase';
</script>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import HTMLGenerator from './htmlGenerator';
import PersistentStorage from './persistentStorage';
import JSZip from 'jszip';
import LZString from 'lz-string';
import ProjectLink from './components/ProjectLink.vue';
import Editor from './components/Editor.vue';
import CSSCanvas from './components/CSSCanvas.vue';
import HelpMenu from './components/HelpMenu.vue';
import LoginMenu from './components/LoginMenu.vue';
import RegisterMenu from './components/RegisterMenu.vue';
import { signOut } from "firebase/auth";
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";

interface CSSProject {
	id: string,
	title: string,
	date: number,
	link: string,
	css: string,
	settings: {
		mode: boolean,
		zoom: number,
		ratios: {
			editor: number,
			canvas: number
		}
	}
}

export default defineComponent({
	name: 'App',
	components: {
		ProjectLink,
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
			loadingProjects: false,
			projects: [] as CSSProject[],
			currentProject: undefined as CSSProject | undefined
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
		async loadProjects (): Promise<void> {
			// Set the loading state for the UI.
			this.loadingProjects = true;
			// 
			if (FirebaseHandler.user.value) {
				// Fetch the user's collection.
				const c = collection(FirebaseHandler.database, FirebaseHandler.user.value.uid);
				// Load all projects in their collection.
				const querySnapshot = await getDocs(c);
				this.projects = [];
				querySnapshot.forEach((doc) => {
					const data = doc.data();
					const project = data as CSSProject;
					project.id = doc.id;
					this.projects.push(project);
				});
				// Sort the projects by date, so that the most recent appear at the top of the list.
				this.projects.sort((a, b) => b.date - a.date);
				// If the user has no projects...
				if (this.projects.length <= 0) {
					if (HTMLGenerator.input.value.length > 0 && !PersistentStorage.projectSaved) {
						// ...create one based on the currently open project.
						const docReference = await addDoc(
							collection(FirebaseHandler.database, FirebaseHandler.user.value.uid),
							{
								id: 'NEWPROJECT',
								title: PersistentStorage.title,
								date: Date.now(),
								link: '',
								css: LZString.compressToBase64(HTMLGenerator.input.value),
								settings: {
									mode: this.colorMode,
									zoom: 1,
									ratios: {
										editor: this.panelRatio.value,
										canvas: 1
									}
								}
							} as CSSProject
						);
						await updateDoc(docReference, { id: docReference.id });
					} else {
						// ...create a new, blank project.
						this.createNewProject();
					}
				}
			}
			// Set the loading state for the UI.
			this.loadingProjects = false;
		},
		async createNewProject (): Promise<void> {
			let confirmation = true;
			if (HTMLGenerator.input.value.length > 0 && !PersistentStorage.projectSaved) {
				confirmation = window.confirm('You have unsaved changes. Are you sure you want to create a new project?');
			}
			if (confirmation) {
				HTMLGenerator.clear();
				PersistentStorage.input = '';
				PersistentStorage.title = 'Untitled';
				if (FirebaseHandler.user.value) {
					this.loadingProjects = true;
					const docReference = await addDoc(
						collection(FirebaseHandler.database, FirebaseHandler.user.value.uid),
						{
							id: 'NEWPROJECT',
							title: 'Untitled',
							date: Date.now(),
							link: '',
							css: '',
							settings: {
								mode: this.colorMode,
								zoom: 1,
								ratios: {
									editor: this.panelRatio.value,
									canvas: 1
								}
							}
						} as CSSProject
					);
					await updateDoc(docReference, { id: docReference.id });
					await this.loadProjects();
					this.loadingProjects = false;
				}
				this.$forceUpdate();
			}
		},
		getProjectDataFromId (projectId: string): CSSProject | undefined {
			return this.projects.find(project => project.id === projectId);
		},
		selectProject (projectId: string): void {
			this.currentProject = this.getProjectDataFromId(projectId);
		},
		async deleteProject (projectId: string): Promise<void> {
			this.loadingProjects = true;
			let confirmation = window.confirm('Are you sure you want to delete this project?');
			if (confirmation && FirebaseHandler.user.value && projectId) {
				try {
					await deleteDoc(doc(FirebaseHandler.database, FirebaseHandler.user.value.uid, projectId));
				} catch (error) {
					console.warn('Delete project failed:', error);
				}
				this.loadProjects();
			}
			this.loadingProjects = false;
		},
		async downloadOutput (): Promise<void> {
			// Create the output files.
			const cssFile = new File([HTMLGenerator.input.value], 'index.css', { type: 'text/css' });
			const htmlFile = new File([
				`<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<meta charset="UTF-8">\n\t\t<meta http-equiv="X-UA-Compatible" content="IE=edge">\n\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t\t<title>${PersistentStorage.title}</title>\n\t\t<link rel="stylesheet" href="index.css">\n\t</head>\n\t<body style="display:flex;">\n<!--Your component-->${HTMLGenerator.output.value}\n\t</body>\n</html>`
			], 'index.html', { type: 'text/html' });

			// Create zip file.
			const zip = new JSZip();
			zip.file('index.css', cssFile);
			zip.file('index.html', htmlFile);
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

		// Reload the projects list when the user logs in/out.
		watch(FirebaseHandler.user, this.loadProjects);
	}
});
</script>

<template>
	<nav>
		<img class="logo" src="./assets/logo-small.webp" alt="CSS Canvas logo" title="CSS Canvas">
		<input type="text" class="projectTitle" v-model="projectTitle">
		<button v-if="!FirebaseHandler.user.value" title="New" @click="createNewProject()">
			<span class="material-symbols-rounded">add_box</span>
		</button>
		<button title="Download" @click="downloadOutput()">
			<span class="material-symbols-rounded">cloud_download</span>
		</button>
		<Transition>
			<button v-if="shareLinkCopied" class="disable" title="Link copied to clipboard" @click.stop="">
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
		<ul class="projectLinks" :class="{ showProjectLinks: FirebaseHandler.user.value }">
			<li>
				<button :class="{ disable: loadingProjects }" style="width: 100%;" title="New project" @click="createNewProject()">
					<span v-if="loadingProjects" class="spinner"></span>
					<span v-else class="material-symbols-rounded">add</span>
				</button>
			</li>
			<li v-for="project of projects" :key="project.id">
				<ProjectLink
					:title="project.title"
					:date="project.date"
					:loading="loadingProjects"
					@click.stop=""
					@delete="deleteProject(project.id)"
				/>
			</li>
		</ul>
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
	<RegisterMenu v-model="showRegister" @login="showLogin = true" @success="" />
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

.projectLinks {
	display: flex;
	flex-flow: column nowrap;
	gap: 0.5rem;
	width: 0;
	height: 100%;
	margin: 0;
	padding: 0.5rem 0ch 1rem;
	list-style: none;
	border-right: 1px solid var(--color-border);
	opacity: 0;
	user-select: none;
	pointer-events: none;
	transition: 0.4s ease width, 0.4s ease opacity;
}
.projectLinks.showProjectLinks {
	width: 30ch;
	padding: 0.5rem 1ch 1rem;
	opacity: 1;
	user-select: revert;
	pointer-events: all;
}
.projectLinks > li {
	display: flex;
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
