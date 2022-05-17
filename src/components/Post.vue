<script setup>
import { usePostStore } from "../stores/post";
import { useUserStore } from "../stores/user";

import { ref, watch, onMounted } from "vue";

import { useQuasar } from "quasar";

const store = usePostStore();
const userStore = useUserStore();
const posts = ref([]);
const $q = useQuasar();
const content = ref("");
const errorMessage = ref("");
const image = ref(null);
const imageUrl = ref("");
const file = ref(null);
const loading = ref(true);
const post = ref(null);
const slide = ref(0);
const commentIsVisible = ref(false);

watch(
	() => store.posts,
	() => {
		posts.value = store.posts;
	}
);

onMounted(async () => {
	await store.getAllPosts();
	await userStore.getAllUsers();
	setTimeout(() => {
		loading.value = false;
	}, 1000);
});

const getUserOfPost = (userId) => {
	const user = JSON.parse(JSON.stringify(userStore.users)).find(
		(user) => user.id === userId
	);
	return user;
};

const handleUpload = () => {
	if (image.value) {
		imageUrl.value = URL.createObjectURL(image.value);
	}
};

const handleUploadBtnClick = () => {
	file.value.pickFiles();
};

const closeImage = () => {
	imageUrl.value = "";
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

const handleSubmit = async () => {
	if (content.value.length > 0 || image.value) {
		const data = new FormData();
		data.append("content", content.value);
		if (image.value) {
			data.append("image", image.value);
		}
		await store.createPost(data);
		if (store.isError) {
			$q.notify({
				color: "red-4",
				textColor: "white",
				icon: "warning",
				message: store.errorMessage,
			});
		} else {
			$q.notify({
				color: "green-4",
				textColor: "white",
				icon: "check",
				message: "Post created",
			});
			post.value = {
				content: content.value,
				attachment: imageUrl.value,
				UserId: JSON.parse(localStorage.getItem("user")).id,
				updatedAt: new Date(),
			};
			content.value = "";
			image.value = null;
			imageUrl.value = "";
			const copyOfPosts = JSON.parse(JSON.stringify(posts.value));
			copyOfPosts.unshift(JSON.parse(JSON.stringify(store.post)));
			posts.value = copyOfPosts;
			setTimeout(() => {
				console.log(store.post);
			}, 300);
		}
	} else {
		errorMessage.value = "Please enter a message";
	}
};

const handleDelete = async (id) => {
	await store.deletePost(id);
	if (store.isError) {
		$q.notify({
			color: "red-5",
			textColor: "white",
			icon: "warning",
			message: store.errorMessage,
		});
	} else {
		$q.notify({
			color: "green-5",
			textColor: "white",
			icon: "check",
			message: "Post deleted",
		});
		posts.value = posts.value.filter((post) => post.id !== id);
	}
};

const handleEdit = (id) => {
	const post = posts.value.find((post) => post.id === id);
	content.value = post.content;
	imageUrl.value = post.image;
	image.value = post.image;
	file.value = post.image;
};
</script>

<template>
	<div class="q-pa-md">
		<!-- Post component wrapper div -->
		<q-card-section
			class="q-mx-auto relative-position"
			style="max-width: 590px"
		>
			<q-input
				v-model="content"
				label="How are you feeling?"
				type="textarea"
				filled
				clearable
				counter
				autogrow
				input-style="height: 200px;"
			>
			</q-input>
			<div class="relative-position q-my-sm" v-if="imageUrl">
				<q-img
					:src="imageUrl"
					class="rounded-borders"
					style="height: 100%"
				/><q-btn
					@click="closeImage"
					icon="close"
					flat
					round
					color="primary"
					class="flex absolute-top-right"
				></q-btn>
				<q-btn
					label="edit"
					flat
					color="primary"
					class="flex absolute-bottom-right"
				></q-btn>
			</div>
			<div class="row justify-between" style="height: fit-content">
				<!-- Image uploader -->
				<q-file
					style="display: none"
					v-model="image"
					@update:model-value="handleUpload"
					ref="file"
					accept="image/jpg, image/jpeg, image/png, image/gif, video/x-msvideo, video/mp4, video/mpeg, video/ogg, video/mp2t, video/webm, video/3gpp, video/3gpp2"
				></q-file>
				<q-btn
					flat
					size="11px"
					@click="handleUploadBtnClick"
					icon="image"
					round
					style="height: fit-content"
				></q-btn>
				<q-btn
					:disable="!content && !imageUrl"
					color="primary"
					outline
					label="Post"
					@click="handleSubmit"
				/>
			</div>
		</q-card-section>
		<q-separator />
		<div v-if="loading">
			<!-- Card Loading -->
			<q-card
				v-for="post in posts"
				:key="post.id"
				style="max-width: 560px"
				class="q-mt-md q-mx-auto"
			>
				<q-item>
					<q-item-section avatar>
						<q-skeleton type="QAvatar" />
					</q-item-section>
					<q-item-section>
						<div class="row">
							<q-item-label>
								<q-skeleton type="text" width="200px" height="20px" />
							</q-item-label>
							<div class="q-ml-sm q-pt-xs">
								<q-item-label caption>
									<q-skeleton type="text" width="150px" />
								</q-item-label>
							</div>
						</div>
					</q-item-section>
				</q-item>
				<q-skeleton height="300px" />

				<q-card-section>
					<q-skeleton type="text" height="30px" />
					<q-skeleton type="text" width="75%" />
					<q-skeleton type="text" width="50%" />
					<q-skeleton type="text" width="75%" />
				</q-card-section>
			</q-card>
		</div>
		<div class="q-pa-md row justify-center move" v-else>
			<q-carousel
				key="q-carousel"
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
				height="auto"
				class="shadow-1 rounded-borders"
				style="width: 800px"
			>
				<q-carousel-slide
					v-for="(post, index) in posts"
					:key="post.id"
					:name="index"
				>
					<div class="row justify-center items-center">
						<q-avatar size="40px" class="q-mr-md" slot="default">
							<q-img
								:src="getUserOfPost(post.UserId).picture"
								fit="cover"
								style="width: 100%; height: 100%"
							/>
						</q-avatar>
						<div class="flex row align-centers">
							<div>
								<q-item-label class="q-ml-sm" slot="default">
									{{ getUserOfPost(post.UserId).lastname }}
									{{ getUserOfPost(post.UserId).firstname }}
								</q-item-label>
							</div>
							<div class="q-ml-sm">
								<q-item-label caption slot="default">
									@{{ getUserOfPost(post.UserId).username }}
								</q-item-label>
							</div>
							<div class="q-ml-sm">
								<q-item-label caption slot="default">
									{{ timeSince(post.updatedAt) }}
								</q-item-label>
							</div>
						</div>
					</div>
					<div class="absolute-top-left">
						<q-btn
							flat
							color="primary"
							icon="edit"
							@click="handleEdit(post.id)"
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
						/>
						<q-btn
							@click="commentIsVisible = !commentIsVisible"
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
					</div>
					<div
						class="q-mt-xl text-center"
						style="word-break: break-word"
						v-if="post.content"
					>
						<q-item-label caption>
							{{ post.content }}
						</q-item-label>
					</div>
				</q-carousel-slide>
			</q-carousel>
			<transition key="transition" name="slide">
				<div class="q-ml-sm" key="comment" v-if="commentIsVisible">
					<q-card
						transition-show="flip-up"
						transition-hide="flip-down"
						style="width: 300px; height: 100%"
						class="shadow-1 rounded-borders flex"
					>
						<q-card-section>
							<q-input
								v-model="comment"
								label="Comment"
								dense
								hide-underline
								class="q-mb-md"
							/>
						</q-card-section>
						<q-card-section>
							<q-btn
								flat
								color="primary"
								@click="handleComment(postId)"
								label="Comment"
								round
								size="11px"
							/>
						</q-card-section>
					</q-card>
				</div>
			</transition>
		</div>
	</div>
</template>

<style lang="scss">
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-enter-active {
	transition: all 0.3s ease-out;
}

.slide-leave-active {
	transition: all 0.4s ease;
}

.slide-move,
.slide-enter-from,
.slide-leave-to {
	transform: translateX(-20px);
	opacity: 0;
}
.slide-move {
	transition: all 0.3s ease-out;
}

.move {
	transition: width 0.3s ease-out;
}
</style>
