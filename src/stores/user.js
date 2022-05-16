import { defineStore } from "pinia";

const API_URL = `${location.protocol}//${location.hostname}:3000`;
import axios from "axios"

export const useUserStore = defineStore("userStore", {
  id: "userStore",
  state: () => ({
    isError: false,
    errorMessage: "",
  }),
  actions: {
    async getAllUser() {
      try {
        const response = await axios.get(`${API_URL}/user`, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    },
    async getUser(id) {
      try {
        const response = await axios.get(`${API_URL}/user/${id}`, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    }
  }
})
