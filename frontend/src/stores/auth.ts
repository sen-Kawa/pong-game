import { useStorage } from '@vueuse/core'
import axios, { AxiosError } from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import jwtInterceptor from '../interceptor/jwtInterceptor'
import router from '../router'
import { socket } from '@/sockets/sockets'

const baseUrlauth = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/`
const baseUrlUser = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users/`
export interface User {
  id: number
  userName: string
  name: string
  email: string
  activated2FA: boolean
  displayName: string
}

export const useAuthStore = defineStore('auth', () => {
  const loginStatus = ref(useStorage('loginStatus', false))
  const profilLoaded = ref(false)
  const userProfile = ref<User>({
    id: 0,
    userName: '',
    name: '',
    email: '',
    activated2FA: false,
    displayName: ''
  })

  const isLoggedIn = computed(() => loginStatus.value)
  const isLoaded = computed(() => profilLoaded.value)
  const activated2FA = computed(() => userProfile.value.activated2FA)

  const getUserId = computed(() => userProfile.value.id)
  const getUserName = computed(() => userProfile.value.userName)
  const getDisplayName = computed(() => userProfile.value.displayName)
  const getName = computed(() => userProfile.value.name)
  const getEmail = computed(() => userProfile.value.email)
  const getId = computed(() => userProfile.value.id)

  const setLoginStatus = (newStatus: boolean) => {
    loginStatus.value = newStatus
  }

  function setUserProfile(date: any) {
    // console.log(date.id);
    // console.log(date.name);
    // console.log(date.userName);
    // console.log(date.email);
    // console.log(date.activated2FA);
    // console.log(date);
    loginStatus.value = true
    profilLoaded.value = true
    userProfile.value.id = date.id
    userProfile.value.name = date.name
    userProfile.value.displayName = date.displayName
    userProfile.value.userName = date.userName
    userProfile.value.email = date.email
    userProfile.value.activated2FA = date.activated2FA
  }

  async function signInFortyTwo() {
    loginStatus.value = true
    router.push('/user/Preference')
  }
  async function validate2fa(code: string) {
    const body = { code: code }
    try {
      await axios.post(baseUrlauth + 'verify2FA', body, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      loginStatus.value = true
      router.push('/user/Preference')
    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (error.response?.status == 401) {
          alert('Took to long restart login')
          router.push('/')
        } else if (error.response?.status == 500) {
          alert('Something went wrong, contact an admin')
          router.push('/')
        } else return error.response?.data?.message
      } else {
        return error
      }
    }
  }

  async function getuserProfile() {
    const response = await jwtInterceptor.get(baseUrlauth + 'user-profile', {
      withCredentials: true
    }).catch(() => {})
    if (response && response.status == 200) {
      setUserProfile(response.data)
    } else {
      loginStatus.value = false
      //router.push('/')
    }
  }

  async function deactivate2FA() {
    const response = await jwtInterceptor
      .get(baseUrlauth + 'deactivate2FA', {
        withCredentials: true
      })
      .catch((err) => {
        if (err.response?.status == 401) {
          loginStatus.value = false
          alert('Need to login to deactivate 2FA')
          router.push('/')
        } else {
          alert('Something went wrong, contact an admin')
        }
      })
    if (response && response.status == 200) {
      userProfile.value.activated2FA = false
    }
  }

  function activate2FA() {
    userProfile.value.activated2FA = true
  }

  async function logout() {
    await jwtInterceptor
      .get(baseUrlauth + 'logout', {
        withCredentials: true
      })
      .catch((error) => {
        if (error.response?.status == 401) alert('Unauthorized, you need to log in')
      })

    loginStatus.value = false
    socket.socket.disconnect()
    router.push('/')
  }

  async function setDisplayName(displayName: string) {
    const body = { displayName: displayName }
    try {
      const response = await jwtInterceptor.patch(baseUrlUser + 'changeDisplay', body, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      if (response && response.data) {
        loginStatus.value = true
        router.push('/user/Preference')
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return error.response?.data?.message
      } else {
        return error
      }
    }
  }
  async function setDisplayName2(displayName: string, returnRoute: string) {
    const body = { displayName: displayName }
    try {
      const response = await jwtInterceptor.patch(baseUrlUser + 'changeDisplay', body, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      if (response && response.data) {
        userProfile.value.displayName = displayName
        loginStatus.value = true
        router.push(returnRoute)
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return error.response?.data?.message
      } else {
        return error
      }
    }
  }
  async function login(username: string) {
    const body = { userid: username }
    try {
      await axios.post(baseUrlauth + 'login', body, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      loginStatus.value = true
      router.push('/leader')
    } catch (error: any) {
      //return error.response.data.message;
    }
  }
  return {
    getUserId,
    getUserName,
    getName,
    getEmail,
    getId,
    activated2FA,
    isLoggedIn,
    isLoaded,
    signInFortyTwo,
    validate2fa,
    getuserProfile,
    deactivate2FA,
    activate2FA,
    logout,
    setLoginStatus,
    setDisplayName,
    setDisplayName2,
    getDisplayName,
    login
  }
})
