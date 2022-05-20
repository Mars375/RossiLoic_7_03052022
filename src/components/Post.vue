<script setup>
import { usePostStore } from "../stores/post";
import { useUserStore } from "../stores/user";
import { useCommentStore } from "../stores/comment";
import { useAuthStore } from "../stores/auth";

import { ref, watch, onMounted, onUpdated } from "vue";

import { useQuasar } from "quasar";

import jwt_decode from "jwt-decode";

const postStore = usePostStore();
const userStore = useUserStore();
const commentStore = useCommentStore();
const authStore = useAuthStore();

let postIds = [];
const post = ref(null);
const posts = ref([]);
const $q = useQuasar();
const content = ref("");
const image = ref(null);
const imageUrl = ref("");
const file = ref(null);
const loading = ref(true);
const commentIsVisible = ref(false);
const comments = ref([]);
const comment = ref("");
const postId = ref(null);
const slide = ref(null);
const editing = ref(false);
const liked = ref(false);
const userWhoLiked = ref(false);

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
	await postStore.getAllPosts();
	await userStore.getAllUsers();
	setTimeout(() => {
		loading.value = false;
	}, 300);
});

const getUserInf = (userId) => {
	const user = userStore.users.find((user) => user.id === userId);
	return user;
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
	if (
		(content.value.length > 0 && !content.value.match(/^\s*$/)) ||
		image.value
	) {
		const data = new FormData();
		data.append("content", content.value);
		if (image.value) {
			data.append("image", image.value);
		}
		await postStore.createPost(data);
		if (postStore.isError) {
			$q.notify({
				color: "red-4",
				textColor: "white",
				icon: "warning",
				message: postStore.errorMessage,
			});
		} else {
			$q.notify({
				color: "green-4",
				textColor: "white",
				icon: "check",
				message: "Post created",
			});
			content.value = "";
			image.value = null;
			imageUrl.value = "";
			const copyOfPosts = posts.value;
			copyOfPosts.unshift(postStore.post);
			posts.value = copyOfPosts;
			postIds.unshift(postStore.post.id);
			slide.value = postIds[0];
		}
	} else {
		$q.notify({
			color: "red-4",
			textColor: "white",
			icon: "warning",
			message: "Please enter a message",
		});
	}
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

const handleEdit = (id) => {
	postId.value = id;
	const post = posts.value.find((post) => post.id === id);
	content.value = post.content;
	imageUrl.value = post.attachment;
	image.value = post.attachment;
	file.value = post.attachment;
};

const handleUpdate = async () => {
	if (
		(content.value.length > 0 || image.value) &&
		!content.value.match(/^\s*$/)
	) {
		const data = new FormData();
		data.append("content", content.value);
		if (image.value) {
			data.append("image", image.value);
		}
		await postStore.updatePost(postId.value, data);
		if (postStore.isError) {
			$q.notify({
				color: "red-4",
				textColor: "white",
				icon: "warning",
				message: postStore.errorMessage,
			});
		} else {
			$q.notify({
				color: "green-4",
				textColor: "white",
				icon: "check",
				message: "Post updated",
			});
			const post = posts.value.find((post) => post.id === postId.value);
			post.content = content.value;
			post.attachment = imageUrl.value;
			content.value = "";
			image.value = null;
			imageUrl.value = "";
			file.value = null;
			editing.value = false;
		}
	} else {
		$q.notify({
			color: "red-4",
			textColor: "white",
			icon: "warning",
			message: "Please enter a message",
		});
	}
};

const sortComments = (comments) => {
	comments.sort((a, b) => {
		return new Date(b.createdAt) - new Date(a.createdAt);
	});
	return comments;
};

const showComments = async (id) => {
	if (!commentIsVisible.value) return;
	postId.value = id;
	await postStore.getPost(id);
	const post = postStore.post;
	comments.value = sortComments(post.Comments);
};

const handleSlideChange = (postId) => {
	showComments(postId);
	alreadyLiked(postId);
};

const handleComment = async () => {
	if (
		(comment.value.length > 0 && !comment.value.match(/^\s*$/)) ||
		image.value
	) {
		await commentStore.createComment(comment.value, postId.value);
		if (commentStore.isError) {
			$q.notify({
				color: "red-4",
				textColor: "white",
				icon: "warning",
				message: postStore.errorMessage,
			});
		} else {
			$q.notify({
				color: "green-4",
				textColor: "white",
				icon: "check",
				message: "Comment created",
			});
			comment.value = "";
			const copyOfComments = comments.value;
			copyOfComments.unshift(commentStore.comment);
			posts.value
				.find((post) => post.id === postId.value)
				.Comments.unshift(commentStore.comment);
			comments.value = copyOfComments;
		}
	} else {
		$q.notify({
			color: "red-4",
			textColor: "white",
			icon: "warning",
			message: "Please enter a message",
		});
	}
};

const handleDeleteComment = (id) => {
	$q.dialog({
		title: "Delete comment",
		message: "Are you sure you want to delete this comment?",
		ok: "Yes",
		cancel: true,
		persistent: true,
	})
		.onOk(async () => {
			await commentStore.deleteComment(postId, id);
			if (commentStore.isError) {
				$q.notify({
					color: "red-4",
					textColor: "white",
					icon: "warning",
					message: commentStore.errorMessage,
				});
			} else {
				$q.notify({
					color: "green-4",
					textColor: "white",
					icon: "check",
					message: "Comment deleted",
				});
				const copyOfComments = comments.value.filter(
					(comment) => comment.id !== id
				);
				comments.value = copyOfComments;
				posts.value.find((post) => post.id === postId.value).Comments =
					posts.value
						.find((post) => post.id === postId.value)
						.Comments.filter((comment) => comment.id !== id);
			}
		})
		.onCancel(() => {
			$q.notify({
				color: "red-4",
				textColor: "white",
				icon: "warning",
				message: "Comment not deleted",
			});
		});
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

const showWhoLiked = async (postLiked) => {
	userWhoLiked.value = true;
	post.value = postLiked;
};
</script>

<template>
	<div class="q-pa-md">
		<!-- Post component wrapper div -->
		<q-card-section
			class="q-mx-auto relative-position"
			style="max-width: 590px"
			v-if="authStore.isLoggedIn"
		>
			<q-input
				v-model="content"
				label="How are you feeling?"
				type="textarea"
				filled
				clearable
				:counter="content ? true : false"
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
					v-if="!editing"
				/>
				<q-btn
					:disable="!content && !imageUrl"
					color="primary"
					outline
					label="Update"
					@click="handleUpdate"
					v-if="editing"
				/>
			</div>
		</q-card-section>
		<q-separator v-if="authStore.isLoggedIn" />
		<div v-if="loading">
			<!-- Card Loading -->
			<q-card style="max-width: 560px" class="q-mt-md q-mx-auto">
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
				height="650px"
				class="shadow-1 rounded-borders"
				style="width: 800px"
				@update:model-value="handleSlideChange(slide)"
			>
				<q-carousel-slide v-for="post in posts" :key="post.id" :name="post.id">
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
						v-if="authStore.isLoggedIn && isCreator(post)"
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
								(commentIsVisible = !commentIsVisible) && showComments(post.id)
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
			<div class="dimmed" v-if="userWhoLiked" @click="userWhoLiked = false">
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
				<div class="q-ml-sm" key="comment" v-if="commentIsVisible">
					<!-- comment -->
					<q-card
						transition-show="flip-up"
						transition-hide="flip-down"
						style="width: 300px; height: 700px"
						class="shadow-1 rounded-borders"
					>
						<div style="height: 12%" v-if="authStore.isLoggedIn">
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
						<div class="overflow-auto" style="height: 80%; width: 100%">
							<div>
								<q-card-section v-for="comment in comments" :key="comment.id">
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
									<div>
										<div class="absolute-top-right column">
											<q-btn
												flat
												color="primary"
												icon="delete"
												@click="handleDeleteComment(comment.id)"
												round
												size="10px"
												v-if="authStore.isLoggedIn && isCreator(comment)"
											/>
										</div>
									</div>
									<q-separator></q-separator>
								</q-card-section>
							</div>
						</div>
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
