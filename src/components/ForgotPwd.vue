<script setup>
import { useAuthStore } from "../stores/auth";

import { useQuasar } from "quasar";

import { ref } from "vue";

const store = useAuthStore();
const $q = useQuasar();
const emit = defineEmits();

const email = ref("");

async function onSubmit() {
	await store.sendEmail(email.value);
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
			message: "An email has been sent to you",
		});
		setTimeout(() => {
			emit("close");
		}, 1000);
	}
}
</script>

<template>
	<div class="dimmed">
		<div class="row absolute-center bg-grey-3" style="width: 60%; z-index: 1">
			<div class="col-lg-7 col-md-7 col-sm-7">
				<q-img
					src="../assets/groupomania.png"
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
							v-model="email"
							label="Email"
							outlined
							:rules="[(val) => !!val || 'Field is required']"
						></q-input>
						<div class="q-pa-sm">
							<q-btn
								label="Reset"
								type="submit"
								style="width: 100%"
								class="bg-primary text-white q-pa-sm q-my-lg"
							></q-btn>
						</div>
					</q-form>
				</div>
			</div>
		</div>
	</div>
</template>
