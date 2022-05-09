<script setup>
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "../src/stores/auth";

import { useQuasar } from "quasar";

import { ref } from "vue";

import zxcvbn from "zxcvbn";

const store = useAuthStore();
const $q = useQuasar();
const emit = defineEmits();
const isPwd = ref(true);
const route = useRoute();
const router = useRouter();

const password = ref("");
const pwdConfirm = ref("");

async function onSubmit() {
	await store.resetPassword(route.params.token, password.value);
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
			message: "Your password has been changed",
		});
		setTimeout(() => {
			router.push("/");
			store.login = true;
		}, 1000);
	}
}
</script>

<template>
	<div class="dimmed">
		<div class="row absolute-center bg-grey-3" style="width: 60%; z-index: 1">
			<div class="col-lg-7 col-md-7 col-sm-7">
				<q-img
					src="../src/assets/groupomania.png"
					style="height: 100%; width: 100%"
					loading="eager"
				></q-img>
			</div>
			<div class="col-lg-5 col-md-5 col-sm-5 q-pa-sm">
				<div>
					<q-btn
						icon="close"
						flat
						class="float-right"
						@click="$emit('close')"
					></q-btn>
				</div>
				<div class="">
					<div class="text-h6 text-center text-bold q-pt-xl q-mt-lg">
						Login to continue
					</div>
					<q-form @submit.prevent.stop="onSubmit" class="q-pa-md">
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
						<q-input
							v-model="pwdConfirm"
							:type="isPwd ? 'password' : 'text'"
							label="Password Confirmation"
							outlined
							clearable
							clear-icon="cancel"
							class="q-mt-sm"
							:rules="[
								(val) => !!val || 'Password Required',
								(val) =>
									val.length >= 8 || 'Password must be at least 8 characters',
								(val) => zxcvbn(val).score >= 2 || zxcvbn(val).feedback.warning,
								(val) => val === password || 'Passwords do not match',
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
						<q-btn
							label="Send"
							type="submit"
							style="width: 100%"
							class="bg-primary text-white q-pa-sm q-my-lg"
						></q-btn>
					</q-form>
				</div>
			</div>
		</div>
	</div>
</template>
