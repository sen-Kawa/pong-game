import { defineStore } from 'pinia';
import axios from 'axios';
import { useStorage } from '@vueuse/core'
import router from '../router'
import { truncate } from 'fs';
import { ref, computed } from 'vue'
//TODO env import on vue
const baseUrl = `${import.meta.env.VUE_APP_BACKEND_SERVER_URI}/auth/login`;
export interface User {
	id: number,
	userName:string,
	user42Name: string,
	email: string,
	activated2FA: boolean
  }

export const useAuthStore = defineStore('auth', () => {

		const loginStatus = ref(useStorage("loginStatus",false))
		const userProfile = ref<User>({
				id:0, userName:"", user42Name: "", email : "", activated2FA : false
			})

		const isLoggedIn = computed(() => loginStatus.value
		)
		const activated2FA = computed(() => userProfile.value.activated2FA) 
		
		const getUserName= computed(() =>  userProfile.value.userName)

	function setUserProfile(date: any){
			// console.log(date.id);
			// console.log(date.name);
			// console.log(date.user42Name);
			// console.log(date.email);
			// console.log(date.activated2FA);
			// console.log(date);
			loginStatus.value = true;
			userProfile.value.id = date.id;
			userProfile.value.userName = date.name;
			userProfile.value.user42Name = date.user42Name;
			userProfile.value.email = date.email;
			userProfile.value.activated2FA = date.activated2FA;
		}
		
	async function login(username: string, password: string) {
				const body = { "username": username, "password": password };
				try {
					const response = await axios.post("http://localhost:3000/auth/login", body,  {
						headers: {
				  		'Content-Type': 'application/json'
						},
						withCredentials: true
			  		});
					if (response.data.twoFaEnabled)
						router.push('/user/2fa');
					else
					{
						loginStatus.value = true;
						router.push('/user/Preference');
					}
					//console.log(response.data);
					//return "Succes";
					}
				catch(error: any) {
				//TODO improve error handling
				console.log(error);
				//return error.response.data.message;		
			}
		}

		async function validate2fa(code: string)
		{
			const body = { code: code}
			try {
				const response = await axios.post("http://localhost:3000/auth/verify2FA", body,  {
					headers: {
					  'Content-Type': 'application/json'
					},
					withCredentials: true
				});
				loginStatus.value = true;
				router.push('/user/Preference');
				//console.log(response.data);
				//return "Succes";
				}
			catch(error: any) {
			//TODO improve error handling
			console.log(error);
			//return error.response.data.message;		
		}
		}
		async function getuserProfile(){
			const response = await axios
			.get("http://localhost:3000/auth/user-profile", {
				withCredentials: true
			  })
			  .catch((err) => {
				console.log(err);
				loginStatus.value = false;
				router.push('/');
			  });
		
			if (response && response.data) {
			  setUserProfile(response.data);
			}
		}
		async function deactivate2FA(){
			const response = await axios
			.get("http://localhost:3000/auth/deactivate2FA", {
				withCredentials: true
			  })
			  .catch((err) => {
				console.log(err);
			  });
			  
			if (response && (response.status == 200)) {
				userProfile.value.activated2FA = false;
			}

		}

		function activate2FA(){
			userProfile.value.activated2FA = true;

		}

		async function logout() {
			//TODO delete cookie and redirect
			const response = await axios.get("http://localhost:3000/auth/logout", {
				withCredentials: true
			}).catch((error) => {
				console.log(error);
			});
			if (response && response.data) {
				loginStatus.value = false;
			}
		}
		return { getUserName, activated2FA, isLoggedIn, login, validate2fa, getuserProfile, deactivate2FA, activate2FA, logout }
		}
		
);
