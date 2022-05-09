import { defineStore } from "pinia";

const API_URL = `${location.protocol}//${location.hostname}:3000/`;
import axios from "axios"

export const useAuthStore = defineStore('authStore', {
  id: 'authStore',
  state: () => ({
    isLoggedIn: false,
    isError: false,
    errorMessage: "",
  }),
  actions: {
    async logIn(user) {
      try {
        await axios.post(API_URL + 'auth/login', user, { withCredentials: true })
        this.isError = false
        this.isLoggedIn = true
      }
      catch (error) {
        if (error.response.status === 401) {
          this.isError = true
          this.errorMessage = error.response.data.message
        } else if (error.response.status === 500) {
          this.errorMessage = "An error occured"
        }
      }
    },
    async sendEmail(email) {
      try {
        await axios.post(API_URL + 'password-reset', { email }, { withCredentials: true })
        this.isError = false
      }
      catch (error) {
        if (error.response.status === 401) {
          this.isError = true
          this.errorMessage = error.response.data.message
        } else if (error.response.status === 500) {
          this.errorMessage = "An error occured"
        }
      }
    },
    async resetPassword(token, password) {
      try {
        await axios.post(API_URL + 'password-reset/' + token, { password }, { withCredentials: true })
        this.isError = false
      }
      catch (error) {
        if (error.response.status === 401) {
          this.isError = true
          this.errorMessage = error.response.data.message
        } else if (error.response.status === 500) {
          this.errorMessage = "An error occured"
        }
      }
    },
    async register(user) {
      try {
        const data = await axios.post(API_URL + 'auth/signup', user, { withCredentials: true })
        this.isError = false
        this.isLoggedIn = true
      }
      catch (error) {
        this.isError = true
        if (error.response.status === 403) {
          this.errorMessage = error.response.data.error.errors[0].message
        }
        else if (error.response.status === 401) {
          this.errorMessage = error.response.data.message
        }
        else {
          this.errorMessage = 'An error occured'
        }
      }
    }
  }
})