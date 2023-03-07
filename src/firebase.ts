import { ref } from 'vue';
import type { Ref } from 'vue';
import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { Auth, Unsubscribe, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

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
	authUnsubscribe: Unsubscribe;
	database: Firestore;
	user = ref(null) as Ref<User | null>;

	constructor () {
		// Initialize Firebase.
		this.app = initializeApp(this.firebaseConfig);

		// Initialize Firebase Authentication and get a reference to the service.
		this.auth = getAuth(this.app);
		this.authUnsubscribe = onAuthStateChanged(this.auth, (user) => {
			this.auth = getAuth(this.app);
			this.user.value = user;
			console.log('Auth state changed.');
		});

		// Initialize Firestore.
		this.database = getFirestore(this.app);
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
