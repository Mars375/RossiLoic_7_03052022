<script setup>
import { useAuthStore } from "../stores/auth";
import { useUserStore } from "../stores/user";
import { usePostStore } from "../stores/post";

import { ref, onMounted, watch } from "vue";

import { useQuasar } from "quasar";

const $q = useQuasar();
const authStore = useAuthStore();
const userStore = useUserStore();
const postStore = usePostStore();
const tab = ref(null);
const userId = ref(null);
const isLoading = ref(true);
const slide = ref(null);
const posts = ref([]);
let postIds = [];

watch(
	() => postStore.posts,
	() => {
		posts.value = JSON.parse(JSON.stringify(postStore.posts));
		postIds = posts.value.map((post) => post.id);
		slide.value = postIds[0];
	}
);

onMounted(async () => {
	if (userStore.user) {
		userId.value = userStore.user.id;
	} else {
		userId.value = JSON.parse(localStorage.getItem("user")).id;
	}
	await postStore.getPostsOfUser(userId.value);
	await userStore.getUser(userId.value);
	await userStore.getAllUsers();
	setTimeout(() => {
		isLoading.value = false;
	}, 1000);
});

const getUserInf = (userId) => {
	const user = JSON.parse(JSON.stringify(userStore.users)).find(
		(user) => user.id === userId
	);
	return user;
};

const timeSince = (date) => {
	date = new Date(date);
	const seconds = Math.floor((new Date() - date) / 1000);
	let interval = Math.floor(seconds / 31536000);
	if (interval >= 1) {
		return interval + " y";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval >= 1) {
		return interval + " m";
	}
	interval = Math.floor(seconds / 86400);
	if (interval >= 1) {
		return interval + " d";
	}
	interval = Math.floor(seconds / 3600);
	if (interval >= 1) {
		return interval + " h";
	}
	interval = Math.floor(seconds / 60);
	if (interval >= 1) {
		return interval + " m";
	}
	if (interval > 1 || interval === 0) {
		return seconds + " s";
	}
};
</script>

<template>
	<div>
		<div v-if="isLoading">
			<div class="absolute-center">
				<q-spinner-clock color="primary" size="3em" />
			</div>
		</div>
		<div v-else>
			<q-img
				:src="userStore.user.background"
				fit="cover"
				contain
				class="pa-0"
				style="height: 300px"
			/>
			<q-card
				flat
				class="row"
				style="margin-top: -80px; background-color: #1fe0"
			>
				<q-card-section style="width: 30%" class="q-py-none">
					<div class="column items-center">
						<q-avatar size="150px" class="q-mt-lg">
							<q-img :src="userStore.user.picture" class="pa-0" />
						</q-avatar>
						<p class="q-mt-md text-h6 q-mb-none">
							{{ userStore.user.firstname }} {{ userStore.user.lastname }}
						</p>
						<div class="text-center text-caption text-weight-light text-grey-7">
							<p class="no-margin">@{{ userStore.user.username }}</p>
							<p class="no-margin">
								{{ userStore.user.email }}
							</p>
						</div>
						<div class="row justify-evenly q-mt-lg" style="width: 100%">
							<p class="no-margin text-grey-8">
								{{ userStore.user.Follows.length }}
							</p>
							<p class="no-margin text-grey-8">
								{{ userStore.user.Follows.length }}
							</p>
						</div>
						<div
							class="row justify-evenly q-mt-md text-grey-7"
							style="width: 100%"
						>
							<p class="no-margin">Followers</p>
							<p class="no-margin">Following</p>
						</div>
					</div>
					<q-separator class="q-mt-md" />
					<div class="q-mt-md text-center text-grey-9">
						<p>
							{{ userStore.user.bio }}
						</p>
					</div>
					<div class="text-center">
						<q-btn
							icon="fab fa-twitter"
							class="q-mt-md"
							flat
							round
							text-color="blue-5"
						/>
						<q-btn
							icon="fab fa-facebook"
							class="q-mt-md"
							flat
							round
							text-color="blue-9"
						/>
						<q-btn
							icon="fab fa-dribbble"
							class="q-mt-md"
							flat
							round
							text-color="pink-5"
						/>
						<q-btn
							icon="fab fa-pinterest"
							class="q-mt-md"
							flat
							round
							text-color="red-5"
						/>
					</div>
				</q-card-section>
				<q-card-section style="width: 70%; margin-top: -100px">
					<q-carousel
						v-model="slide"
						transition-prev="slide-right"
						transition-next="slide-left"
						swipeable
						draggable="false"
						animated
						control-color="primary"
						navigation-icon="radio_button_unchecked"
						navigation
						padding
						arrows
						height="600px"
						class="shadow-1 rounded-borders q-mx-auto"
						style="width: 80%"
					>
						<q-carousel-slide
							v-for="post in postStore.posts"
							:key="post.id"
							:name="post.id"
						>
							<div class="row justify-center items-center">
								<q-avatar size="40px" class="q-mr-md" slot="default">
									<q-img
										:src="getUserInf(post.UserId).picture"
										fit="cover"
										style="width: 100%; height: 100%"
									/>
								</q-avatar>
								<div class="flex row align-centers">
									<div>
										<q-item-label class="q-ml-sm" slot="default">
											{{ getUserInf(post.UserId).lastname }}
											{{ getUserInf(post.UserId).firstname }}
										</q-item-label>
									</div>
									<div class="q-ml-sm">
										<q-item-label caption slot="default">
											@{{ getUserInf(post.UserId).username }}
										</q-item-label>
									</div>
									<div class="q-ml-sm">
										<q-item-label caption slot="default">
											{{ timeSince(post.updatedAt) }}
										</q-item-label>
									</div>
								</div>
							</div>
							<div
								class="absolute-top-left"
								v-if="authStore.isLoggedIn && isCreator"
							>
								<q-btn
									flat
									color="primary"
									icon="edit"
									@click="(editing = true) && handleEdit(post.id)"
									round
									size="11px"
								/>
								<q-btn
									flat
									color="primary"
									icon="delete"
									@click="handleDelete(post.id)"
									round
									size="11px"
								/>
							</div>
							<div class="absolute-top-right">
								<q-btn
									flat
									color="primary"
									icon="favorite"
									@click="handleLike(post.id)"
									round
									size="11px"
									v-if="liked"
								/>
								<q-btn
									flat
									color="primary"
									icon="favorite_border"
									@click="handleLike(post.id)"
									round
									size="11px"
									:disable="!authStore.isLoggedIn"
									v-else
								/>
								<q-btn
									@click="
										(commentIsVisible = !commentIsVisible) &&
											showComments(post.id)
									"
									flat
									color="primary"
									icon="comment"
									round
									size="11px"
								/>
							</div>
							<div v-if="post.attachment" class="q-mt-md">
								<q-img
									:src="post.attachment"
									fit="cover"
									style="width: 100%; height: 100%"
								/>
								<div
									class="q-mt-xl text-center"
									style="word-break: break-word"
									v-if="post.content"
								>
									<q-item-label caption>
										{{ post.content }}
									</q-item-label>
								</div>
							</div>
							<div class="absolute-center" style="width: 80%" v-else>
								<q-item-label class="text-body1" slot="default">
									{{ post.content }}
								</q-item-label>
							</div>
						</q-carousel-slide>
					</q-carousel>
				</q-card-section>
			</q-card>
		</div>
	</div>
</template>
