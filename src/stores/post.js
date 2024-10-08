import { defineStore } from "pinia";
import axios from "axios";

const API_URL = "https://groupomania-back.onrender.com";

// Configurer Axios pour inclure les cookies par défaut
axios.defaults.withCredentials = true;

export const usePostStore = defineStore("postStore", {
  id: "postStore",
  state: () => ({
    isError: false,
    errorMessage: "",
    likeMessage: "",
    posts: [],
    post: {},
    likes: [],
  }),
  actions: {
    async getAllPosts() {
      try {
        const response = await axios.get(`${API_URL}/post`);
        if (response.status === 200) {
          this.isError = false;
          this.posts = response.data.posts;
        } else {
          this.isError = true;
          this.errorMessage = response.data.message || "Error fetching posts";
        }
      } catch (error) {
        this.isError = true;
        this.errorMessage = error.message || "Error fetching posts";
      }
    },
    async getPostsOfUser(id) {
      try {
        const response = await axios.get(`${API_URL}/post/user/${id}`);
        if (response.status === 200) {
          this.isError = false;
          this.posts = response.data.posts;
        } else {
          this.isError = true;
        }
      } catch (error) {
        this.isError = true;
      }
    },
    async getPostByCategories(categories) {
      try {
        const response = await axios.get(`${API_URL}/post/category/${categories}`);
        if (response.status === 200) {
          this.isError = false;
          this.posts = response.data.posts;
        } else {
          this.isError = true;
        }
      } catch (error) {
        this.isError = true;
      }
    },
    async getPost(id) {
      try {
        const response = await axios.get(`${API_URL}/post/${id}`);
        if (response.status === 200) {
          this.isError = false;
          this.post = response.data.post;
        } else {
          this.isError = true;
        }
      } catch (error) {
        this.isError = true;
      }
    },
    async createPost(post) {
      try {
        const response = await axios.post(`${API_URL}/post`, post);
        if (response.status === 200 || response.status === 201) {
          this.isError = false;
          this.post = response.data.post;
        } else {
          this.isError = true;
          this.errorMessage = response.data.message;
        }
      } catch (error) {
        this.isError = true;
        if (error.response && error.response.status === 403) {
          this.errorMessage = "You do not have permission to create a post.";
        } else {
          this.errorMessage = error.message;
        }
      }
    },
    async updatePost(id, post) {
      try {
        const response = await axios.put(`${API_URL}/post/${id}`, post);
        if (response.status === 200) {
          this.isError = false;
          this.post = response.data.post;
        } else {
          this.isError = true;
        }
      } catch (error) {
        this.isError = true;
      }
    },
    async deletePost(id) {
      try {
        const response = await axios.delete(`${API_URL}/post/${id}`);
        if (response.status === 200) {
          this.isError = false;
          this.posts = this.posts.filter(post => post.id !== id);
          this.likes = this.likes.filter(like => like.postId !== id);
        } else {
          this.isError = true;
        }
      } catch (error) {
        this.isError = true;
      }
    },
    async likePost(id) {
      try {
        const response = await axios.post(`${API_URL}/post/${id}/like`, {});
        if (response.status === 200) {
          this.isError = false;
          this.post = response.data.post;
          this.likeMessage = response.data.message;
        } else {
          this.isError = true;
        }
      } catch (error) {
        this.isError = true;
      }
    },
    async getLikes(id) {
      if (!id) {
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/post/${id}/like`);
        if (response.status === 200) {
          this.isError = false;
          this.likes = response.data.likes;
        } else {
          this.isError = true;
        }
      } catch (error) {
        this.isError = true;
      }
    }
  }
});