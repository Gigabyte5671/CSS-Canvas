import { ref } from 'vue';
import type { Ref } from 'vue';
import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { Auth, Unsubscribe, User } from 'firebase/auth';
import { getFirestore, collection, doc, query, onSnapshot, updateDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { CSSProject } from './datastructure';

class FirebaseHandler {
	static instance: FirebaseHandler;
	private firebaseConfig = {
		apiKey: 'AIzaSyDVHbeVE1lOMGfRhIczbegsXMptb3YvSNY',
		authDomain: 'css-canvas.firebaseapp.com',
		projectId: 'css-canvas',
		storageBucket: 'css-canvas.appspot.com',
		messagingSenderId: '33965155888',
		appId: '1:33965155888:web:a805564ea908dd9fc9aff5'
	};
	app: FirebaseApp;
	auth: Auth;
	private authUnsubscribe: Unsubscribe;
	database: Firestore;
	user = ref(null) as Ref<User | null>;
	projects = ref(new Map<string, CSSProject>());
	selectedProject = ref(undefined) as Ref<string | undefined>;
	private projectsUnsubscribe: Unsubscribe | undefined;
	loading = ref(true);

	constructor () {
		// Initialize Firebase.
		this.app = initializeApp(this.firebaseConfig);

		// Initialize Firestore.
		this.database = getFirestore(this.app);

		// Initialize Firebase Authentication and get a reference to the service.
		this.auth = getAuth(this.app);
		this.authUnsubscribe = onAuthStateChanged(this.auth, (user) => {
			this.auth = getAuth(this.app);
			this.user.value = user;
			console.log(user ? 'Logged in.' : 'Logged out.');

			// Unsubscribe from data changes if the user logged out.
			this.projectsUnsubscribe?.();
			this.projectsUnsubscribe = undefined;

			// Listen to changes in the collection.
			if (user) {
				const q = query(collection(this.database, user.uid));
				this.projectsUnsubscribe = onSnapshot(q, (querySnapshot) => {
					// Set the loading state for the UI.
					this.loading.value = true;

					// Load any changed projects.
					querySnapshot.docChanges().forEach((change) => {
						if (change.type === 'removed') {
							this.projects.value.delete(change.doc.id);
							return;
						}
						this.projects.value.set(change.doc.id, change.doc.data() as CSSProject);
					});

					// Sort all projects by date.
					const sorted = [];
					for (const project of this.projects.value) {
						sorted.push(project);
					}
					this.projects.value.clear();
					sorted.sort((a, b) => b[1].date - a[1].date);
					for (const [id, project] of sorted) {
						this.projects.value.set(id, project);
					}

					// If no project is selected, select the first in the list.
					if (sorted.length > 0 && !this.selectedProject.value) {
						this.selectedProject.value = sorted[0][0];
					}

					// Set the loading state for the UI.
					this.loading.value = false;
				});
			}
		});
	}

	/**
	 * Update any property of a given CSS Canvas project in the connected database.
	 * @param projectId The ID of the project document.
	 * @param property The property to update.
	 * @param value The new value for the property.
	 */
	async updateProjectValue <T extends keyof CSSProject> (projectId: string | undefined, property: T, value: CSSProject[T]): Promise<void> {
		if (this.user.value && projectId) {
			const updatedValue = {} as Record<T, CSSProject[T]>;
			updatedValue[property] = value;
			const docReference = doc(this.database, this.user.value.uid, projectId);
			await updateDoc(docReference, updatedValue);
		}
	}

	/**
	 * Get a reference to the singleton instance of the FirebaseHandler class.
	 */
	static getInstance (): FirebaseHandler {
		if (!FirebaseHandler.instance) {
			FirebaseHandler.instance = new FirebaseHandler();
		}
		return FirebaseHandler.instance;
	}
}

export default FirebaseHandler.getInstance();
