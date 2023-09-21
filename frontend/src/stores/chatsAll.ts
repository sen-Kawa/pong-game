import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const server = import.meta.env.VITE_BACKEND_SERVER_URI

export const useChatsStore = defineStore('chats', () => {
  const authStore = useAuthStore();

  const fetchForKhrov = async (path: string, meth: string, body: object): Promise<any> => {
    if (! meth.match(/^GET$|^HEAD$|^POST$|^PUT$|^PATCH$|^DELETE$/i) ) return;
    const response = await useFetch(server + path, meth, body);
    if (!response) {
      return false;
    }
    else if (response && response.status===401) {
      const refreshResponse = await useFetch(server + '/auth/refresh', 'GET', {});
      if (refreshResponse.ok) {
        console.log('unauthorized')
        return fetchForKhrov(path, meth, body)
      }
      else {
        authStore.setLoginStatus(false);
      }
    }
    return response;
  }
  const useFetch = async (path: string, meth: string, body: object): Promise<any> => {
    try {
      const res = fetch(path, {
        method: meth,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: meth.match(/^GET$|^HEAD$/i) ? undefined : JSON.stringify(body),
        credentials: 'include'
      })
      return res;
    } catch (error) {
      return false;
    }
  }

  return { fetchForKhrov }
})
