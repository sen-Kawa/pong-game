import { defineStore } from 'pinia';
import axios from 'axios';
import { useStorage } from '@vueuse/core'
import router from '../router'
import { ref, computed } from 'vue'
import jwtInterceptor from '../interceptor/jwtInterceptor';

const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/`;
export interface User {
	id: number,
	userName:string,
	name:string,
	email: string,
	activated2FA: boolean
  }

export const useAuthStore = defineStore('auth', () => {

		const loginStatus = ref(useStorage("loginStatus",false))
		const userProfile = ref<User>({
				id:0, userName:"", name: "", email : "", activated2FA : false
			})

		const isLoggedIn = computed(() => loginStatus.value
		)
		const activated2FA = computed(() => userProfile.value.activated2FA) 
		
		const getUserName= computed(() =>  userProfile.value.name)

	function setUserProfile(date: any){
			// console.log(date.id);
			// console.log(date.name);
			// console.log(date.userName);
			// console.log(date.email);
			// console.log(date.activated2FA);
			// console.log(date);
			loginStatus.value = true;
			userProfile.value.id = date.id;
			userProfile.value.name = date.name;
			userProfile.value.userName = date.userName;
			userProfile.value.email = date.email;
			userProfile.value.activated2FA = date.activated2FA;
		}
		
	async function login(username: string, password: string) {
		
				const body = { "username": username, "password": password };
				try {
					const response = await axios.post(baseUrl + "login", body,  {
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
	async function signInFortyTwo(params: string){

			loginStatus.value = true;
			router.push('/user/Preference');

			
		}
		async function validate2fa(code: string)
		{
			const body = { code: code}
			try {
				const response = await axios.post(baseUrl + "verify2FA", body,  {
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
			const response = await jwtInterceptor
			.get(baseUrl + "user-profile", {
				withCredentials: true
			  })
			if (response && response.status == 200 ) {
			  setUserProfile(response.data);
			}else
			{
				router.push('/');
			}
		}
		async function deactivate2FA(){
			const response = await axios
			.get(baseUrl + "deactivate2FA", {
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
			const response = await jwtInterceptor.get(baseUrl + "logout", {
				withCredentials: true
			}).catch((error) => {
				console.log(error);
			});
			if (response && response.data) {
				loginStatus.value = false;
				router.push('/');
			}
		}
		return { getUserName, activated2FA, isLoggedIn, login, signInFortyTwo, validate2fa, getuserProfile, deactivate2FA, activate2FA, logout }
		}
		
);
