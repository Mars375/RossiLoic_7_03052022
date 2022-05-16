<script setup>
import { usePostStore } from "../stores/post";

import { ref, watch, onMounted } from "vue";

import { useQuasar } from "quasar";

const store = usePostStore();
const posts = ref(null);
const $q = useQuasar();
const post = ref(null);
const content = ref("");
const errorMessage = ref("");
const image = ref(null);
const imageUrl = ref("");
const file = ref(null);

watch(
	() => store.posts,
	() => {
		posts.value = store.posts;
	}
);

onMounted(() => {
	store.getAllPosts();
});

const handleUpload = () => {
	if (image.value) {
		imageUrl.value = URL.createObjectURL(image.value);
	}
};

const handleUploadBtnClick = () => {
	file.value.pickFiles();
};

function newPost(content) {
	store.newPost(content);
}
</script>

<template>
	<div class="q-pa-md">
		<q-card-section
			class="q-mx-auto relative-position"
			style="max-width: 590px"
		>
			<q-input
				v-model="content"
				label="How are you feeling?"
				type="textarea"
				autofocus
				filled
				clearable
				counter
				autogrow
				@keydown.enter.prevent="newPost"
				input-style="height: 200px;"
			>
			</q-input>
			<div class="row justify-between" style="height: fit-content">
				<q-file
					style="display: none"
					v-model="image"
					@update:model-value="handleUpload"
					ref="file"
				></q-file>
				<q-btn
					flat
					size="10px"
					@click="handleUploadBtnClick"
					icon="image"
					round
					style="height: fit-content"
				></q-btn>
				<q-btn color="primary" outline label="Post" @click="newPost(content)" />
			</div>
		</q-card-section>
		<q-separator />
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
					<q-item-label>
						<q-skeleton type="text" width="300px" height="20px" />
					</q-item-label>
					<q-item-label caption>
						<q-skeleton type="text" width="150px" />
					</q-item-label>
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
</template>
