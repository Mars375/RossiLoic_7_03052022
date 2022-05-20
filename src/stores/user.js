import { defineStore } from "pinia";

const API_URL = `${location.protocol}//${location.hostname}:3000`;
import axios from "axios"

export const useUserStore = defineStore("userStore", {
  id: "userStore",
  state: () => ({
    isError: false,
    errorMessage: "",
    user: "",
    users: [{}],
  }),
  actions: {
    async getAllUsers() {
      try {
        const response = await axios.get(`${API_URL}/user`, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
          this.users = response.data
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
          this.user = response.data
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    }
  },
  getters: {
    getUserInf: (state) => {
      state.users
    }
  }
})
