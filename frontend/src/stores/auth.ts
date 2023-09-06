import { defineStore } from 'pinia'
import axios from 'axios'
import { useStorage } from '@vueuse/core'
import router from '../router'
import { ref, computed } from 'vue'
import jwtInterceptor from '../interceptor/jwtInterceptor'
import { AxiosError } from 'axios'

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
  const userProfile = ref<User>({
    id: 0,
    userName: '',
    name: '',
    email: '',
    activated2FA: false,
    displayName: 'bbb'
  })

  const playerName : string = ''
  const isLoggedIn = computed(() => loginStatus.value)
  const activated2FA = computed(() => userProfile.value.activated2FA)

  const getUserName = computed(() => userProfile.value.userName)
  const getName = computed(() => userProfile.value.name)
  const getEmail = computed(() => userProfile.value.email)
  const getDisplayName = computed(() => userProfile.value.displayName)

  function setUserProfile(date: any) {
    // console.log(date.id);
    // console.log(date.name);
    // console.log(date.userName);
    // console.log(date.email);
    // console.log(date.activated2FA);
    // console.log(date);
    loginStatus.value = true
    userProfile.value.id = date.id
    userProfile.value.name = date.name
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
    })
    if (response && response.status == 200) {
      setUserProfile(response.data)
    } else {
      loginStatus.value = false
      router.push('/')
    }
    
  }

  async function readDisplayName(): Promise<string> {
    let res1: any = fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/displayName`,
    {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    //   headers: {
    //       "Content-Type": "application/json"
    //   },
    })
    let res2 = res1.json()
    // console.log("zzzzzzz ", res1.json())
    return 'abc'
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

  return {
    getUserName,
    getName,
    getEmail,
    activated2FA,
    isLoggedIn,
    signInFortyTwo,
    validate2fa,
    getuserProfile,
    deactivate2FA,
    activate2FA,
    logout,
    setDisplayName,
    getDisplayName,
  }
})
