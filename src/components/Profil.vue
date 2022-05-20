<script setup>
import { useAuthStore } from "../stores/auth";
import { useUserStore } from "../stores/user";
import { usePostStore } from "../stores/post";

import EditProfil from "../components/EditProfil.vue";

import { ref, watch, onUpdated, onMounted } from "vue";

import { useRouter } from "vue-router";

import { useQuasar } from "quasar";

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const postStore = usePostStore();
const userId = ref(null);
const user = ref(null);
const isLoading = ref(true);
const slide = ref(null);
const posts = ref([]);
const liked = ref(false);
const post = ref(null);
const commentIsVisible = ref(false);
const postId = ref(null);
const comments = ref([]);
const userWhoLiked = ref(false);
let postIds = [];
const image = ref(null);
const imageUrl = ref(null);
const file = ref(null);
const handleEdit = ref(false);

watch(
	() => postStore.posts,
	() => {
		if (!postStore.posts) {
			return;
		}
		posts.value = postStore.posts;
		postIds = posts.value.map((post) => post.id);
		slide.value = postIds[0];
		alreadyLiked(slide.value);
	}
);

onUpdated(() => {
	alreadyLiked(slide.value);
});

onMounted(async () => {
	userId.value = JSON.parse(localStorage.getItem("user")).id;
	await postStore.getPostsOfUser(userId.value);
	await userStore.getUser(userId.value);
	await userStore.getAllUsers();
	user.value = userStore.user;
	setTimeout(() => {
		isLoading.value = false;
	}, 1000);
});

const getUserInf = (userId) => {
	const user = userStore.users.find((user) => user.id === userId);
	return user;
};

const handleSlideChange = (postId) => {
	showComments(postId);
	alreadyLiked(postId);
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
const isCreator = (content) => {
	if (document.cookie.includes("jwt")) {
		const token = document.cookie
			.split(";")
			.find((cookie) => cookie.includes("jwt"));
		const decoded = jwt_decode(token.split("=")[1]);
		if (decoded.isAdmin === true) {
			return true;
		}
	}
	if (!postStore.posts) {
		return;
	}
	if (content.UserId) {
		const user = JSON.parse(localStorage.getItem("user"));
		return content.UserId === user.id;
	}
	if (content.userId) {
		const user = JSON.parse(localStorage.getItem("user"));
		return content.userId === user.id;
	}
	return false;
};

const showComments = async (id) => {
	if (!commentIsVisible.value) return;
	postId.value = id;
	await postStore.getPost(id);
	const post = postStore.post;
	comments.value = sortComments(post.Comments);
};

const handleDeleteComment = async (id) => {
	if (window.confirm("Are you sure you want to delete this comment?")) {
		await commentStore.deleteComment(postId, id);
		if (commentStore.isError) {
			$q.notify({
				color: "red-5",
				textColor: "white",
				icon: "warning",
				message: commentStore.errorMessage,
			});
		} else {
			$q.notify({
				color: "green-5",
				textColor: "white",
				icon: "check",
				message: "Comment deleted",
			});
			comments.value = comments.value.filter((comment) => comment.id !== id);
		}
	}
};

const handleLike = async (id) => {
	await postStore.likePost(id);
	if (postStore.isError) {
		$q.notify({
			color: "red-5",
			textColor: "white",
			icon: "warning",
			message: postStore.errorMessage,
		});
	} else {
		$q.notify({
			color: "green-5",
			textColor: "white",
			icon: "check",
			message: postStore.likeMessage,
		});
		const post = posts.value.find((post) => post.id === id);
		post.likes = postStore.post.likes;
		alreadyLiked(id);
	}
};

const alreadyLiked = async (id) => {
	await postStore.getLikes(id);
	const user = JSON.parse(localStorage.getItem("user"));
	if (!user) {
		liked.value = false;
	} else {
		liked.value = postStore.likes.find((like) => like.userId === user.id);
		!liked.value ? (liked.value = false) : (liked.value = true);
	}
};

const sortComments = (comments) => {
	comments.sort((a, b) => {
		return new Date(b.createdAt) - new Date(a.createdAt);
	});
	return comments;
};

const handleUpload = () => {
	if (image.value) {
		imageUrl.value = URL.createObjectURL(image.value);
	}
};

const handleEditBackground = () => {
	file.value.pickFiles();
};

const closeImage = () => {
	imageUrl.value = "";
};

const handleBack = () => {
	localStorage.removeItem("tab");
	router.go();
};

const handleDelete = async (id) => {
	$q.dialog({
		title: "Delete post",
		message: "Are you sure you want to delete this post?",
		ok: "Yes",
		cancel: true,
		persistent: true,
	})
		.onOk(async () => {
			await postStore.deletePost(id);
			if (postStore.isError) {
				$q.notify({
					color: "red-5",
					textColor: "white",
					icon: "warning",
					message: postStore.errorMessage,
				});
			} else {
				$q.notify({
					color: "green-5",
					textColor: "white",
					icon: "check",
					message: "Post deleted",
				});
				posts.value = posts.value.filter((post) => post.id !== id);
				if (postIds.indexOf(id) - 1 >= 0) {
					slide.value = postIds[postIds.indexOf(id) - 1];
				} else {
					slide.value = postIds[0];
				}
				postIds = postIds.filter((postId) => postId !== id);
			}
		})
		.onCancel(() => {
			$q.notify({
				color: "red-5",
				textColor: "white",
				icon: "warning",
				message: "Post not deleted",
			});
		});
};

const refreshUser = () => {
	handleEdit.value = false;
	isLoading.value = true;
	user.value = userStore.user;
	setTimeout(() => {
		isLoading.value = false;
	}, 1000);
};

const showWhoLiked = async (postLiked) => {
	userWhoLiked.value = true;
	post.value = postLiked;
};

const handleUploadBackground = async () => {
	const formData = new FormData();
	formData.append("image", image.value);
	await userStore.updateBackground(user.value.id, formData);
	if (userStore.isError) {
		$q.notify({
			color: "red-5",
			textColor: "white",
			icon: "warning",
			message: userStore.errorMessage,
		});
	} else {
		$q.notify({
			color: "green-5",
			textColor: "white",
			icon: "check",
			message: "Background updated",
		});
		user.value.background = userStore.user.background;
		imageUrl.value = "";
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
				:src="user.background"
				fit="cover"
				contain
				class="pa-0"
				style="height: 300px"
				v-if="!imageUrl"
			/>
			<div v-if="imageUrl">
				<q-img :src="imageUrl" style="height: 300px" /><q-btn
					@click="closeImage"
					icon="close"
					flat
					round
					color="primary"
					class="flex absolute-top-right"
				></q-btn>
			</div>
			<q-file
				style="display: none"
				v-model="image"
				@update:model-value="handleUpload"
				ref="file"
				accept="image/jpg, image/jpeg, image/png, image/gif, video/x-msvideo, video/mp4, viideo/mpeg, video/ogg, video/mp2t, video/webm, video/3gpp, video/3gpp2"
			></q-file>
			<q-btn
				flat
				@click="handleEditBackground"
				label="Edit background"
				class="absolute-top-right q-mt-xl"
				v-if="!imageUrl"
			></q-btn>
			<q-btn
				flat
				@click="handleUploadBackground"
				label="Upload background"
				class="absolute-top-right q-mt-xl"
				v-if="imageUrl"
			></q-btn>
			<q-icon
				name="arrow_back"
				@click="handleBack"
				class="q-mt-xl q-ml-lg absolute-top-left cursor-pointer"
				size="40px"
				color="primary"
			/>
			<q-card
				flat
				class="row"
				style="margin-top: -80px; background-color: #1fe0"
			>
				<q-card-section style="width: 30%" class="q-py-none">
					<div class="column items-center">
						<q-avatar size="150px" class="q-mt-lg">
							<q-img :src="user.picture" class="pa-0" />
						</q-avatar>
						<p class="q-mt-md text-h6 q-mb-none">
							{{ user.firstname }} {{ user.lastname }}
						</p>
						<div class="absolute-top-right q-mt-xl">
							<q-btn
								label="Edit"
								color="primary"
								flat
								@click="handleEdit = true"
								class="q-mt-xl"
							/>
							<EditProfil v-if="handleEdit" @close="refreshUser" />
						</div>

						<div class="text-center text-caption text-weight-light text-grey-7">
							<p class="no-margin">@{{ user.username }}</p>
							<p class="no-margin">
								{{ user.email }}
							</p>
						</div>
						<div class="row justify-evenly q-mt-lg" style="width: 100%">
							<p class="no-margin text-grey-8">
								{{ user.Follows.length }}
							</p>
							<p class="no-margin text-grey-8">
								{{ user.Follows.length }}
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
						height="700px"
						class="shadow-1 rounded-borders q-mx-auto"
						style="width: 80%"
						@update:model-value="handleSlideChange(slide)"
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
									icon="delete"
									@click="handleDelete(post.id)"
									round
									size="11px"
								/>
							</div>
							<div class="absolute-top-right">
								<q-btn
									class="q-mt-sm"
									flat
									color="primary"
									icon="favorite"
									@click.prevent="handleLike(post.id)"
									round
									size="14px"
									v-if="liked"
								>
									<q-btn
										class="q-mt-md"
										size="11px"
										color="red"
										floating
										dense
										padding="0 4px"
										:label="post.likes ? post.likes : ''"
										@click.stop="showWhoLiked(post)"
										style="pointer-events: auto"
									/>
								</q-btn>
								<q-btn
									class="q-mt-sm"
									flat
									color="primary"
									icon="favorite_border"
									@click.prevent="handleLike(post.id)"
									round
									size="14px"
									:disable="!authStore.isLoggedIn"
									v-else
								/>
								<q-btn
									class="q-mt-sm"
									@click="
										(commentIsVisible = !commentIsVisible) &&
											showComments(post.id)
									"
									flat
									color="primary"
									round
									size="14px"
								>
									<q-icon class="q-mt-xs" name="comment" />
									<q-btn
										class="q-mt-md"
										size="11px"
										color="red"
										floating
										dense
										padding="0 4px"
										:label="
											post.Comments
												? post.Comments.length > 0
													? post.Comments.length
													: ''
												: ''
										"
									/>
								</q-btn>
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
				<div
					class="dimmed fullscreen"
					v-if="userWhoLiked"
					@click="userWhoLiked = false"
				>
					<q-card
						class="absolute-center z-top overflow-auto"
						style="width: 200px; height: 400px"
					>
						<q-card-section>
							<q-btn
								flat
								color="primary"
								icon="close"
								@click="userWhoLiked = null"
								round
								size="11px"
								class="absolute-top-right"
							/>
							<q-list dense>
								<q-item v-for="user in post.Users" :key="user.id">
									<q-item-section avatar>
										<q-avatar size="40px" class="q-mr-md" slot="default">
											<q-img
												:src="user.picture"
												fit="cover"
												style="width: 100%; height: 100%"
											/>
										</q-avatar>
									</q-item-section>
									<q-item-section>
										<q-item-label>
											<q-item-label caption>
												{{ user.username }}
											</q-item-label>
										</q-item-label>
									</q-item-section>
								</q-item>
							</q-list>
						</q-card-section>
					</q-card>
				</div>
				<transition key="transition" name="slide">
					<div
						class="q-ml-sm"
						key="comment"
						v-if="commentIsVisible"
						style="width: 100%; height: 250px"
					>
						<!-- comment -->
						<q-card
							transition-show="flip-up"
							transition-hide="flip-down"
							style="width: 100%; height: 100%"
							class="shadow-1 rounded-borders"
						>
							<div v-if="authStore.isLoggedIn">
								<q-card-section class="q-pa-sm" style="height: 50px">
									<q-input
										v-model="comment"
										label="Comment"
										dense
										hide-underline
										@keyup.enter="handleComment(postId)"
									/>
								</q-card-section>
								<q-card-section class="q-pa-sm">
									<q-btn
										color="primary"
										@click="handleComment(postId)"
										label="Comment"
										outline
										class="float-right"
										:disable="!comment"
									/>
								</q-card-section>
							</div>
							<q-card-section
								class="q-mt-xl overflow-auto"
								style="height: 130px"
							>
								<q-list>
									<q-item
										v-for="comment in comments"
										:key="comment.id"
										class="q-ml-sm column"
									>
										<div class="flex row align-centers">
											<q-avatar size="40px" class="q-mr-md" slot="default">
												<q-img
													:src="getUserInf(comment.userId).picture"
													fit="cover"
													style="width: 100%; height: 100%"
												/>
											</q-avatar>
											<div>
												<div class="row">
													<q-item-label class="q-ml-sm" slot="default">
														{{ getUserInf(comment.userId).lastname }}
														{{ getUserInf(comment.userId).firstname }}
													</q-item-label>
													<div class="q-ml-xs">
														<q-item-label caption slot="default">
															— {{ timeSince(comment.updatedAt) }}
														</q-item-label>
													</div>
												</div>
												<div class="q-ml-sm">
													<q-item-label caption slot="default">
														@{{ getUserInf(comment.userId).username }}
													</q-item-label>
												</div>
											</div>
										</div>
										<div
											class="q-mt-md flex q-mb-md"
											style="word-break: break-word"
										>
											{{ comment.content }}
										</div>
									</q-item>
								</q-list>
							</q-card-section>
						</q-card>
					</div>
				</transition>
			</q-card>
		</div>
	</div>
</template>
