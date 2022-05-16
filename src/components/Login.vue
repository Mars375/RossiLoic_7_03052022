<script setup>
import { useAuthStore } from "../stores/auth";

import { useUserStore } from "../stores/user";

import { useQuasar } from "quasar";

import { ref } from "vue";

const store = useAuthStore();
const userStore = useUserStore();
const $q = useQuasar();
const emit = defineEmits();

const email = ref("");
const password = ref("");
const staySign = ref("false");
const isPwd = ref(true);
const errorMessage = ref("");

async function onSubmit() {
	const user = {
		email: email.value,
		password: password.value,
		staySign: staySign.value,
	};
	await store.logIn(user);
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
</script>

<template>
	<div class="dimmed">
		<div
			class="row absolute-center bg-grey-3"
			style="width: 60%; height: 680px; z-index: 1"
		>
			<div class="gt-sm col-lg-7 col-md-7 col-sm-7">
				<q-img
					src="../assets/groupomania.png"
					style="height: 100%; height: 680px; width: 100%"
					loading="eager"
				></q-img>
			</div>
			<div class="col-lg-5 col-md-5 col-sm-12 q-pa-sm">
				<div>
					<q-btn
						icon="close"
						flat
						class="float-right"
						@click="emit('close')"
					></q-btn>
				</div>
				<div class="">
					<div class="text-h6 text-center text-bold q-pt-lg q-mt-lg">
						Login to continue
					</div>
					<q-form @submit.prevent.stop="onSubmit" class="q-pa-md">
						<q-input
							v-model="email"
							label="Email"
							outlined
							:rules="[(val) => !!val || 'Field is required']"
						></q-input>
						<q-input
							v-model="password"
							:type="isPwd ? 'password' : 'text'"
							label="Password"
							outlined
							class="q-mt-sm"
							@keyup.enter="onSubmit"
							:rules="[(val) => !!val || 'Field is required']"
						>
							<q-icon
								:name="isPwd ? 'visibility_off' : 'visibility'"
								class="cursor-pointer q-my-auto"
								@click="isPwd = !isPwd"
								size="1.5rem"
							/>
						</q-input>
						<div class="q-pa-sm">
							<q-checkbox
								v-model="staySign"
								label="Stay Signed In"
							></q-checkbox>
							<q-btn flat no-caps class="float-right" @click="emit('forgot')"
								>Forgot password ?</q-btn
							>
							<q-btn
								label="Login"
								type="submit"
								style="width: 100%"
								class="bg-primary text-white q-pa-sm q-my-lg"
							></q-btn>
						</div>
					</q-form>
					<div class="q-mt-xl text-center">
						<span class="text-grey">or continue using</span>
						<div class="q-gutter-sm q-mt-sm row justify-center">
							<q-btn
								icon="fab fa-facebook-f"
								size="sm"
								round
								class="bg-blue text-white"
							></q-btn>
							<GoogleLogin :callback="callback">
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
					<div class="text-center q-mt-xl">
						<span>First time on Groupomania ?</span>
						<q-btn flat no-caps class="text-bold text-h7" @click="emit('sign')"
							>Signup</q-btn
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
