import { defineStore } from "pinia";

const API_URL = `${location.protocol}//${location.hostname}:3000`;
import axios from "axios"

export const usePostStore = defineStore("postStore", {
  id: "postStore",
  state: () => ({
    isError: false,
    errorMessage: "",
    posts: [],
    post: {},

  }),
  actions: {
    async getAllPosts() {
      try {
        const response = await axios.get(`${API_URL}/post`, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
          this.posts = response.data.posts
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    },
    async getPostOfUser(id) {
      try {
        const response = await axios.get(`${API_URL}/post/user/${id}`, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
          this.posts = response.data.posts
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    },
    async getPostByCategories(categories) {
      try {
        const response = await axios.get(`${API_URL}/post/category/${categories}`, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
          this.posts = response.data.posts
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    },
    async getPost(id) {
      try {
        const response = await axios.get(`${API_URL}/post/${id}`, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
          this.post = response.data.post
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    },
    async createPost(post) {
      try {
        const response = await axios.post(`${API_URL}/post`, post, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
          this.post = response.data.posts
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    },
    async updatePost(id, post) {
      try {
        const response = await axios.put(`${API_URL}/post/${id}`, post, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
          this.post = response.data.post
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    },
    async deletePost(id) {
      try {
        const response = await axios.delete(`${API_URL}/post/${id}`, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
          this.post = response.data.post
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    }
  }
})
