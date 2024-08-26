import { defineStore } from "pinia";

const API_URL = 'https://groupomania-back.onrender.com';
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
    },
    async updateUser(id, user) {
      try {
        const response = await axios.put(`${API_URL}/user/${id}`, user, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
          this.user = response.data.user
        } else {
          this.isError = true
        }
      } catch (error) {
        this.isError = true
      }
    },
    async deleteUser(id) {
      try {
        const response = await axios.delete(`${API_URL}/user/${id}`, { withCredentials: true });
        if (response.status === 200) {
          this.isError = false
        } else {
          this.isError = true
          this.errorMessage = response.data.message
        }
      } catch (error) {
        this.isError = true
      }
    },
    async updateBackground(id, background) {
      try {
        const response = await axios.put(`${API_URL}/user/${id}/background`, background, { withCredentials: true });
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
