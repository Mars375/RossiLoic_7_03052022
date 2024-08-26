import { defineStore } from "pinia";

const API_URL = "https://groupomania-back.onrender.com";
import axios from "axios"

export const useAuthStore = defineStore('authStore', {
  id: 'authStore',
  state: () => ({
    isLoggedIn: false,
    isError: false,
    errorMessage: "",
    user: {},
  }),
  actions: {
    async googleLogin(token) {
      const data = await axios.post(`${API_URL}/auth/google`, token, { withCredentials: true });
      if (data.status === 200) {
        this.isLoggedIn = true
        this.isError = false
        this.errorMessage = ""
        this.user = data.data.user
      } else {
        this.isLoggedIn = false
        this.isError = true
        this.errorMessage = "Something went wrong"
      }
    },
    async logIn(user) {
      try {
        const data = await axios.post(API_URL + '/auth/login', user, { withCredentials: true })
        if (data.status === 200) {
          this.isError = false
          this.isLoggedIn = true
          this.user = data.data.user
        } else {
          this.isError = true
          this.errorMessage = "Something went wrong"
        }
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
        await axios.post(API_URL + '/password-reset', { email }, { withCredentials: true })
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
        await axios.post(API_URL + '/password-reset/' + token, { password }, { withCredentials: true })
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
        const data = await axios.post(API_URL + '/auth/signup', user, { withCredentials: true })
        this.isError = false
        this.isLoggedIn = true
        this.user = data.data.user
      }
      catch (error) {
        this.isError = true
        if (error.response.status === 403) {
          this.errorMessage = error.response.data.error.errors[0].message
        }
        else if (error.response.status === 401) {
          this.errorMessage = error.response.data.message
        }
        else if (error.response.status === 400) {
          this.errorMessage = error.response.data.error
        }
        else {
          this.errorMessage = 'An error occured'
        }
      }
    },
    async logOut() {
      try {
        await axios.post(API_URL + '/auth/logout', {}, { withCredentials: true })
        this.isLoggedIn = false
        this.isError = false
        this.errorMessage = ""
        localStorage.removeItem("user")
      }
      catch (error) {
        this.isError = true
        this.errorMessage = "An error occured"
      }
    },
  }
})