<script lang="ts">
import { defineComponent } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';
import FirebaseHandler from '../firebase';

export default defineComponent({
	name: 'LoginMenu',
	props: {
		modelValue: { type: Boolean, required: true }
	},
	emits: ['update:modelValue', 'signup', 'success'],
	data() {
		return {
			email: '',
			password: '',
			loading: false,
			error: false
		};
	},
	methods: {
		show (): void {
			this.$emit('update:modelValue', true);
		},
		hide (): void {
			this.$emit('update:modelValue', false);
		},
		login (): void {
			this.loading = true;
			signInWithEmailAndPassword(FirebaseHandler.auth, this.email, this.password)
				.then((userCredential) => {
					// Signed in.
					const user = userCredential.user;
					this.loading = false;
					this.$emit('success');
					this.hide();
				})
				.catch((error) => {
					this.loading = false;
					this.error = true;
					console.warn('[Auth failure] Login:', error.code, error.message);
				});
		}
	},
	watch: {
		email (): void {
			this.error = false;
		},
		password (): void {
			this.error = false;
		}
	}
});
</script>

<template>
	<div
		v-if="modelValue"
		class="popup"
		@click="hide()"
	>
		<article @click.stop="">
			<button class="close" @click="hide()"><span class="material-symbols-rounded">close</span></button>
			<h2>Login</h2>
			<form @submit.prevent="login()">
				<label for="email">Email
					<input type="email" name="email" v-model="email">
				</label>
				<label for="password">Password
					<input type="password" name="password" v-model="password">
				</label>
				<p v-if="error" style="margin: 0;color: #f33;font-size: small;"><i>Incorrect email/password. Please try again.</i></p>
				<button type="submit" :class="{ disable: loading }">
					<span v-if="loading" class="spinner"></span>
					<template v-else>Login</template>
				</button>
			</form>
			<div class="signUpLink">
				<p>Don't have an account?</p>
				<button :class="{ disable: loading }" @click.stop="{ $emit('signup'); hide(); }">Sign up</button>
			</div>
		</article>
	</div>
</template>

<style scoped>
.popup > article form {
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	gap: 1.5rem;
}
.popup > article form label {
	width: 100%;
}
.popup > article form input {
	width: 100%;
	padding: 0.25em;
	font-size: 1rem;
	border: 1px solid var(--color-border);
	border-radius: 5px;
	transition: 0.1s ease background-color;
}
.popup > article form button[type="submit"] {
	font-size: 1rem;
}

.popup .signUpLink {
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
	gap: 1ch;
	margin-top: 1rem;
	font-size: small;
	opacity: 0.6;
	transition: 0.1s ease opacity;
}
.popup .signUpLink:hover {
	opacity: 1;
}
.popup .signUpLink p {
	display: contents;
}
.popup .signUpLink button {
	display: inline-flex;
	font-size: inherit;
}
</style>
