<script setup>
import { useUserStore } from "../stores/user";

import { ref, onBeforeMount, watch } from "vue";

import { useQuasar } from "quasar";

import zxcvbn from "zxcvbn";

const userStore = useUserStore();
const $q = useQuasar();
const emit = defineEmits();
const user = ref(JSON.parse(localStorage.getItem("user")));
const picture = ref(null);
const pictureUrl = ref(null);
const pictureFile = ref(null);
const username = ref(null);
const email = ref(null);
const password = ref(null);
const passwordConfirm = ref(null);
const firstname = ref(null);
const lastname = ref(null);
const isLoading = ref(true);
const file = ref(null);
const bio = ref(null);
const isPwd1 = ref(true);
const isPwd2 = ref(true);

watch(
	() => userStore.user,
	() => {
		user.value = userStore.user;
		username.value = userStore.user.username;
		email.value = userStore.user.email;
		firstname.value = userStore.user.firstname;
		lastname.value = userStore.user.lastname;
		bio.value = userStore.user.bio;
	}
);

onBeforeMount(async () => {
	await userStore.getUser(user.value.id);
	user.value = userStore.user;
	setTimeout(() => {
		isLoading.value = false;
	}, 1000);
});

const editProfil = async () => {
	if (
		username.value !== null &&
		email.value !== null &&
		firstname.value !== null &&
		lastname.value !== null &&
		bio.value !== null
	) {
		if (password.value === passwordConfirm.value) {
			const formData = new FormData();
			formData.append("username", username.value);
			formData.append("email", email.value);
			if (password.value !== null) {
				formData.append("password", password.value);
			}
			formData.append("firstname", firstname.value);
			formData.append("lastname", lastname.value);
			formData.append("bio", bio.value);
			if (pictureFile.value !== null) {
				formData.append("picture", pictureFile.value);
			}
			await userStore.updateUser(user.value.id, formData);
			if (userStore.isError)
				$q.notify({
					color: "red",
					textColor: "white",
					message: userStore.errorMessage,
					position: "top",
					timeout: 3000,
				});
			else {
				$q.notify({
					color: "green",
					textColor: "white",
					message: "Profil mis à jour",
					position: "top",
					timeout: 3000,
				});
				emit("close");
			}
		} else {
			$q.notify({
				message: "Les mots de passe ne correspondent pas",
				color: "negative",
				position: "top",
				timeout: 2000,
			});
		}
	} else {
		$q.notify({
			message: "Veuillez remplir tous les champs",
			color: "negative",
			position: "top",
			timeout: 2000,
		});
	}
};

const handleEditPicture = () => {
	file.value.pickFiles();
};

const handleUpload = () => {
	if (picture.value) {
		pictureUrl.value = URL.createObjectURL(picture.value);
	}
};

const closeImage = () => {
	pictureUrl.value = "";
};

const validatePassword = () => {
	if (password.value.length > 0) {
		const result = zxcvbn(password.value);
		if (result.score < 2) {
			$q.notify({
				message: "Le mot de passe est trop faible",
				color: "negative",
				position: "top",
				timeout: 2000,
			});
			isPwd1.value = false;
			isPwd2.value = false;
		} else {
			$q.notify({
				message: "Le mot de passe est correct",
				color: "positive",
				position: "top",
				timeout: 2000,
			});
			isPwd1.value = false;
			isPwd2.value = false;
		}
	}
};
const isEmail = () => {
	if (email.value.length > 0) {
		const re =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (re.test(String(email.value).toLowerCase())) {
			$q.notify({
				message: "L'adresse email est correcte",
				color: "positive",
				position: "top",
				timeout: 2000,
			});
			return true;
		} else {
			$q.notify({
				message: "L'adresse email est incorrecte",
				color: "negative",
				position: "top",
				timeout: 2000,
			});
			return false;
		}
	}
};
const handleDelete = () => {
	userStore.deleteUser(user.value.id);
	$q.notify({
		message: "Votre compte a bien été supprimé",
		color: "positive",
		position: "top",
		timeout: 2000,
	});
};
</script>

<template>
	<q-card class="fullscreen">
		<q-inner-loading
			:showing="isLoading"
			label="Please wait..."
			label-class="text-teal"
			label-style="font-size: 1.1em"
		/>
		<div v-if="!isLoading" style="width: 30%" class="q-mx-auto">
			<q-btn
				color="primary"
				flat
				round
				icon="close"
				@click="$emit('close')"
				class="absolute-top-right"
			/>
			<q-toolbar>
				<q-toolbar-title class="column">
					<div class="q-mx-auto q-mt-md">
						<q-avatar size="130px" color="primary" style="margin-right: 10px">
							<img v-if="!pictureUrl" :src="user.picture" alt="avatar" />
							<img v-else :src="pictureUrl" alt="avatar" />
							<q-file
								style="display: none"
								v-model="picture"
								ref="file"
								@update:model-value="handleUpload"
								accept="image/*"
							/>
							<q-btn
								color="primary"
								padding="0"
								icon="camera"
								@click="handleEditPicture"
								class="absolute-top-right"
							/>
							<q-btn
								color="primary"
								padding="0"
								icon="close"
								@click="closeImage"
								class="absolute-top-left"
								v-if="pictureUrl"
							/>
						</q-avatar>
					</div>
					<q-input
						class="text-center q-mt-lg"
						input-class="text-center"
						v-model="username"
						label="Nom d'utilisateur"
					/>
					<q-input
						class="text-center q-mt-lg"
						input-class="text-center"
						v-model="email"
						label="Email"
						:rules="[
							(v) => !!v || 'Veuillez renseigner votre email',
							(v) => isEmail(v) || 'Veuillez renseigner un email valide',
						]"
					/>
					<q-input
						class="text-center q-mt-lg"
						input-class="text-center"
						v-model="firstname"
						label="Prénom"
					/>
					<q-input
						class="text-center q-mt-lg"
						input-class="text-center"
						v-model="lastname"
						label="Nom"
					/>
					<q-input
						class="text-center q-mt-lg"
						input-class="text-center"
						v-model="password"
						label="Mot de passe"
						:type="isPwd1 ? 'password' : 'text'"
						:rules="[
							(val) => !!val || 'Password Required',
							(val) =>
								val.length >= 8 || 'Password must be at least 8 characters',
							(val) => zxcvbn(val).score >= 2 || zxcvbn(val).feedback.warning,
						]"
					>
						<q-icon
							:name="isPwd1 ? 'visibility_off' : 'visibility'"
							class="cursor-pointer q-my-auto"
							@click="isPwd1 = !isPwd1"
							size="1.5rem"
						/>
					</q-input>
					<q-input
						class="text-center q-mt-lg"
						input-class="text-center"
						v-model="passwordConfirm"
						label="Confirmation du mot de passe"
						:type="isPwd2 ? 'password' : 'text'"
						:rules="[
							(val) => !!val || 'Password Required',
							(val) =>
								val.length >= 8 || 'Password must be at least 8 characters',
							(val) => zxcvbn(val).score >= 2 || zxcvbn(val).feedback.warning,
							(val) => val === password || 'Passwords do not match',
						]"
					>
						<q-icon
							:name="isPwd2 ? 'visibility_off' : 'visibility'"
							class="cursor-pointer q-my-auto"
							@click="isPwd2 = !isPwd2"
							size="1.5rem"
						/>
					</q-input>
					<q-input
						type="textarea"
						v-model="bio"
						label="Bio"
						:rules="[
							(val) =>
								val.length < 255 || 'Bio must be less than 255 characters',
						]"
					/>
				</q-toolbar-title>
			</q-toolbar>
			<q-card-section>
				<q-btn
					color="primary"
					@click="handleDelete"
					flat
					label="Supprimer mon compte"
					class="float-left"
				/>
				<q-btn
					label="Modifier le profil"
					color="primary"
					@click="editProfil"
					class="float-right"
				></q-btn>
			</q-card-section>
		</div>
	</q-card>
</template>
