import { defineStore } from "pinia"

const API_URL = "http://localhost:3000";
import axios from "axios"

export const useCommentStore = defineStore("commentStore", {
  id: "commentStore",
  state: () => ({
    isError: false,
    errorMessage: "",
    comments: [],
    comment: {},
  }),
  actions: {
    async createComment(content, id) {
      try {
        const response = await axios.post(`${API_URL}/post/${id}/comment`, { content }, { withCredentials: true });
        if (response.status === 200 || response.status === 201) {
          this.isError = false
          this.comment = response.data.comment
        } else {
          this.isError = true
        }
      }
      catch (error) {
        this.isError = true
      }
    },
    async deleteComment(postId, commentId) {
      try {
        const response = await axios.delete(`${API_URL}/post/${postId}/comment/${commentId}`, { withCredentials: true });
        if (response.status === 200 || response.status === 201) {
          this.isError = false
        } else {
          this.isError = true
          this.errorMessage = response.data.message
        }
      }
      catch (error) {
        this.isError = true
      }
    }
  }
})