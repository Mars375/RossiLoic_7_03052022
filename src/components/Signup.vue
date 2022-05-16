<script setup>
import { useAuthStore } from "../stores/auth";

import { useQuasar } from "quasar";

import { ref } from "vue";

import zxcvbn from "zxcvbn";

const store = useAuthStore();
const $q = useQuasar();
const emit = defineEmits();

const email = ref("");
const password = ref("");
const username = ref("");
const isPwd = ref(true);
const accept = ref(false);
const errorMessage = ref("");

async function onSubmit() {
	const user = {
		email: email.value,
		password: password.value,
		username: username.value,
	};
	if (accept.value !== true) {
		$q.notify({
			color: "red-5",
			textColor: "white",
			icon: "warning",
			message: "You need to accept the license and terms first",
		});
		return;
	}
	await store.register(user);
	if (store.isError) {
		$q.notify({
			color: "red-5",
			textColor: "white",
			icon: "warning",
			message: store.errorMessage,
		});
	} else {
		$q.notify({
			color: "green-4",
			textColor: "white",
			icon: "cloud_done",
			message: "You're registered",
		});
		setTimeout(() => {
			emit("close");
		}, 1000);
	}
}

const callback = async (response) => {
	await store.googleLogin(response);
	if (store.isError) {
		$q.notify({
			color: "red-5",
			textColor: "white",
			icon: "warning",
			message: store.errorMessage,
		});
	} else {
		$q.notify({
			color: "green-4",
			textColor: "white",
			icon: "cloud_done",
			message: "You're logged in",
		});
		setTimeout(() => {
			emit("close");
		}, 1000);
	}
};

function isEmailvalid(val) {
	return /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(val);
}
</script>

<template>
	<div class="dimmed">
		<div
			class="row absolute-center bg-grey-3"
			style="width: 60%; height: 650px; z-index: 1"
		>
			<div class="gt-sm col-lg-7 col-md-7 col-sm-7">
				<q-img
					src="../assets/groupomania.png"
					style="height: 650px; width: 100%"
					loading="eager"
				></q-img>
			</div>
			<div class="col-lg-5 col-md-5 col-sm-12 q-pa-sm">
				<div>
					<q-btn
						icon="close"
						flat
						class="float-right"
						@click="$emit('close')"
					></q-btn>
				</div>
				<div class="">
					<div class="text-h6 text-center text-bold q-pt-lg q-mt-lg">
						Signup to continue
					</div>
					<q-form @submit.prevent.stop="onSubmit" class="q-pa-md" autofocus>
						<q-input
							v-model="email"
							label="Email"
							outlined
							clearable
							clear-icon="cancel"
							:rules="[
								(val) => !!val || 'Email Required',
								(val) => isEmailvalid(val) || 'Must be a valid email.',
							]"
							lazy-rules
						>
						</q-input>
						<q-input
							v-model="username"
							label="Username"
							outlined
							clearable
							clear-icon="cancel"
							class="q-mt-sm"
							:rules="[
								(val) => !!val || 'Username Required',
								(val) =>
									val.length >= 3 || 'Username must be at least 3 characters.',
							]"
						></q-input>
						<q-input
							v-model="password"
							:type="isPwd ? 'password' : 'text'"
							label="Password"
							outlined
							clearable
							clear-icon="cancel"
							class="q-mt-sm"
							:rules="[
								(val) => !!val || 'Password Required',
								(val) =>
									val.length >= 8 || 'Password must be at least 8 characters',
								(val) => zxcvbn(val).score >= 2 || zxcvbn(val).feedback.warning,
							]"
						>
							<q-icon
								:name="isPwd ? 'visibility_off' : 'visibility'"
								class="cursor-pointer q-my-auto"
								@click="isPwd = !isPwd"
								size="1.5rem"
							/>
							<template #error>
								{{ errorMessage }}
							</template>
						</q-input>
						<div class="q-pa-sm">
							<q-toggle
								v-model="accept"
								label="I accept the license and terms"
							/>
							<q-btn
								label="Signup"
								type="submit"
								style="width: 100%"
								class="bg-primary text-white q-pa-sm"
							></q-btn>
						</div>
					</q-form>
					<div class="q-mt-lg text-center">
						<span class="text-grey">or continue using</span>
						<div class="q-gutter-sm q-mt-md row justify-center">
							<q-btn
								icon="fab fa-facebook-f"
								size="sm"
								round
								class="bg-blue text-white"
							></q-btn
							><GoogleLogin :callback="callback">
								<q-btn
									icon="fab fa-google"
									size="sm"
									round
									class="bg-red text-white"
								></q-btn>
							</GoogleLogin>
							<q-btn
								icon="fab fa-linkedin-in"
								size="sm"
								round
								class="bg-blue text-white"
							></q-btn>
						</div>
					</div>
					<div class="text-center q-mt-lg">
						<span>Already a member ?</span>
						<q-btn flat no-caps class="text-bold text-h7" @click="$emit('log')">
							Login</q-btn
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
