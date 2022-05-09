<script setup>
import Signup from "../src/components/Signup.vue";
import Login from "../src/components/Login.vue";
import Post from "../src/components/Post.vue";
import ForgotPwd from "../src/components/ForgotPwd.vue";

import { useAuthStore } from "../src/stores/auth";

import { ref, markRaw } from "vue";

const store = useAuthStore();

const tab = ref(null);

const rightDrawerOpen = ref(false);

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
}
</script>

<template>
	<!-- Mobile & Tablet version menu -->
	<div>
		<component :is="Post" class="lt-md" />
		<Login
			class="lt-md"
			v-if="tab == Login"
			@close="changeTab('Post')"
			@sign="changeTab('Signup')"
			@forgot="changeTab('ForgotPwd')"
		/>
		<Signup
			class="lt-md"
			v-if="tab == Signup"
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
					<q-btn flat @click="changeTab('Login')">Se connecter</q-btn>
					<q-btn flat @click="changeTab('Signup')">S'inscrire</q-btn>
					<q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
				</q-toolbar>
			</q-header>

			<q-drawer v-model="rightDrawerOpen" side="right" overlay bordered>
				<!-- drawer content -->
				<q-scroll-area style="height: calc(100% - 150px); margin-top: 150px">
					<q-list padding>
						<q-item clickable @click="changeTab('Login')">
							<q-item-section avatar>
								<q-icon name="login"></q-icon>
							</q-item-section>
							<q-item-section> Se connecter </q-item-section>
						</q-item>
						<q-item clickable @click="changeTab('Signup')">
							<q-item-section avatar>
								<q-icon name="person_add"></q-icon>
							</q-item-section>
							<q-item-section> S'inscrire </q-item-section>
						</q-item>
					</q-list>
				</q-scroll-area>
				<q-img
					class="absolute-top"
					src="https://cdn.quasar.dev/img/material.png"
					style="height: 150px"
				>
					<div class="absolute-bottom bg-transparent">
						<q-avatar size="56px" class="q-mb-sm">
							<img src="https://cdn.quasar.dev/img/boy-avatar.png" />
						</q-avatar>
						<div class="text-weight-bold">Razvan Stoenescu</div>
						<div>@rstoenescu</div>
					</div>
				</q-img>
			</q-drawer>
			<q-page-container>
				<component :is="Post" />
				<Login
					v-if="tab == Login"
					@close="changeTab('Post')"
					@sign="changeTab('Signup')"
					@forgot="changeTab('ForgotPwd')"
				/>
				<Signup
					v-if="tab == Signup"
					@close="changeTab('Post')"
					@log="changeTab('Login')"
				/>
				<ForgotPwd v-if="tab == ForgotPwd" @close="changeTab('Post')" />
			</q-page-container>
		</q-layout>
	</div>
</template>
