<script setup>
import Signup from "../src/components/Signup.vue";
import Login from "../src/components/Login.vue";
import Post from "../src/components/Post.vue";
import ForgotPwd from "../src/components/ForgotPwd.vue";

import { useAuthStore } from "../src/stores/auth";

import { ref, markRaw, watch } from "vue";

import { useQuasar } from "quasar";

const $q = useQuasar();

const store = useAuthStore();

const tab = ref(null);

const rightDrawerOpen = ref(false);

const user = ref(null);

watch(
	() => store.user,
	() => {
		localStorage.setItem("user", JSON.stringify(store.user));
	},
	{ deep: true } // <-- this is the important part
);

user.value = JSON.parse(localStorage.getItem("user"));

function toggleRightDrawer() {
	rightDrawerOpen.value = !rightDrawerOpen.value;
}
function changeTab(compName) {
	const lookup = {
		Signup,
		Login,
		Post,
		ForgotPwd,
	};
	tab.value = markRaw(lookup[compName]);
	rightDrawerOpen.value = false;
}
function newPost() {
	changeTab("Post");
	toggleRightDrawer();
}
function logout() {
	store.logOut();
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
			message: "You're logged out",
		});
		rightDrawerOpen.value = false;
	}
}
</script>

<template>
	<!-- Mobile & Tablet version menu -->
	<div>
		<component :is="Post" class="lt-md" />
		<Login
			class="lt-md"
			v-if="tab == Login && !store.isLoggedIn"
			@close="changeTab('Post')"
			@sign="changeTab('Signup')"
			@forgot="changeTab('ForgotPwd')"
		/>
		<Signup
			class="lt-md"
			v-if="tab == Signup && !store.isLoggedIn"
			@close="changeTab('Post')"
			@log="changeTab('Login')"
		/>
		<ForgotPwd
			class="lt-md"
			v-if="tab == ForgotPwd"
			@close="changeTab('Post')"
		/>
		<div class="lt-md fixed-bottom relative">
			<q-btn
				class="absolute-center z-top"
				padding="12px"
				color="white"
				text-color="primary"
				round
				stack
				label="Acceuil"
				icon="home"
				@click="changeTab('Post')"
			/>
			<q-btn-group spread>
				<q-btn
					align="left"
					stack
					class="q-py-md q-pr-xl"
					push
					color="primary"
					label="Connexion"
					icon="login"
					@click="changeTab('Login')"
					v-if="!store.isLoggedIn"
				/>
				<q-btn
					align="right"
					stack
					class="q-py-md q-pl-xl"
					push
					color="primary"
					label="Inscription"
					icon="person_add"
					@click="changeTab('Signup')"
					v-if="!store.isLoggedIn"
				/>
			</q-btn-group>
		</div>
		<!-- Desktop version menu   -->
		<q-layout class="gt-sm" view="hhh LpR fFf">
			<q-header reveal elevated class="bg-primary text-white">
				<q-toolbar>
					<q-toolbar-title>
						<q-btn flat @click="changeTab('Post')">
							<q-avatar>
								<img src="../src/assets/logo.png" />
							</q-avatar>
							Groupomania
						</q-btn>
					</q-toolbar-title>
					<q-btn flat @click="changeTab('Login')" v-if="!store.isLoggedIn"
						>Se connecter</q-btn
					>
					<q-btn flat @click="changeTab('Signup')" v-if="!store.isLoggedIn"
						>S'inscrire</q-btn
					>
					<q-btn flat @click="logout" v-if="store.isLoggedIn"
						>Se Déconnecter</q-btn
					>
					<q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
				</q-toolbar>
			</q-header>

			<q-drawer v-model="rightDrawerOpen" side="right" overlay bordered>
				<!-- drawer content -->
				<q-scroll-area style="height: calc(100% - 150px); margin-top: 150px">
					<q-list padding>
						<!-- menu when isn't logged -->
						<q-item
							clickable
							@click="changeTab('Login')"
							v-if="!store.isLoggedIn"
						>
							<q-item-section avatar>
								<q-icon name="login"></q-icon>
							</q-item-section>
							<q-item-section> Se connecter </q-item-section>
						</q-item>
						<q-item
							clickable
							@click="changeTab('Signup')"
							v-if="!store.isLoggedIn"
						>
							<q-item-section avatar>
								<q-icon name="person_add"></q-icon>
							</q-item-section>
							<q-item-section> S'inscrire </q-item-section>
						</q-item>
						<!-- menu when is logged -->
						<q-item clickable @click="newPost" v-if="store.isLoggedIn">
							<q-item-section avatar>
								<q-icon name="add"></q-icon>
							</q-item-section>
							<q-item-section> Nouveau Post </q-item-section>
						</q-item>
						<q-item clickable @click="profile" v-if="store.isLoggedIn">
							<q-item-section avatar>
								<q-icon name="person"></q-icon>
							</q-item-section>
							<q-item-section> Mon profil </q-item-section>
						</q-item>
						<q-item clickable @click="logout" v-if="store.isLoggedIn">
							<q-item-section avatar>
								<q-icon name="exit_to_app"></q-icon>
							</q-item-section>
							<q-item-section> Se déconnecter </q-item-section>
						</q-item>
					</q-list>
				</q-scroll-area>
				<q-img
					class="absolute-top"
					src="https://cdn.quasar.dev/img/material.png"
					style="height: 150px"
					v-if="!store.isLoggedIn"
				>
				</q-img>
				<q-img
					class="absolute-top"
					src="../src/assets/groupomania.png"
					style="height: 150px"
					v-else
				>
					<div class="absolute-bottom bg-transparent">
						<q-avatar size="56px" class="q-mb-sm">
							<img :src="user.picture" />
						</q-avatar>
						<div class="text-weight-bold">
							{{ user.firstname }} {{ user.lastname }}
						</div>
						<div>@{{ user.username }}</div>
					</div>
				</q-img>
			</q-drawer>
			<q-page-container>
				<component :is="Post" />
				<Login
					v-if="tab == Login && !store.isLoggedIn"
					@close="changeTab('Post')"
					@sign="changeTab('Signup')"
					@forgot="changeTab('ForgotPwd')"
				/>
				<Signup
					v-if="tab == Signup && !store.isLoggedIn"
					@close="changeTab('Post')"
					@log="changeTab('Login')"
				/>
				<ForgotPwd v-if="tab == ForgotPwd" @close="changeTab('Post')" />
			</q-page-container>
		</q-layout>
	</div>
</template>
