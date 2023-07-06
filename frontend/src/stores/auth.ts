import { defineStore } from 'pinia';
import axios from 'axios';
import { useStorage } from '@vueuse/core'
import router from '../router'
import { truncate } from 'fs';

//TODO env import on vue
const baseUrl = `${import.meta.env.VUE_APP_BACKEND_SERVER_URI}/auth/login`;

export const useAuthStore = defineStore('auth', {

	state: () => ({ 
			loginStatus : useStorage("loginStatus",false),
			userProfile: {
					id: 0,
					userName:"",
					user42Name: "",
					email: "",
					activated2FA: false
				}
			}),
	getters: {
		isLoggedIn() {
				if(this.loginStatus === false)
					return false;
				return true;
			},
		activated2FA(): boolean {
				return this.userProfile.activated2FA;
			},
		
		getUserName(): string{
			return this.userProfile.userName
		} 
	},
	actions: {	
		setUserProfile(date: any){
			this.loginStatus = true;
			this.userProfile.id = date.userId;
			this.userProfile.userName = date.userName;
			this.userProfile.user42Name = date.user42Name;
			this.userProfile.email = date.email;
			this.userProfile.activated2FA = date.activated2FA;
		},
		
		async login(username: string, password: string) {
				const body = { "username": username, "password": password };
				try {
					const response = await axios.post("http://localhost:3000/auth/login", body,  {
						headers: {
				  		'Content-Type': 'application/json'
						},
						withCredentials: true
			  		});
					this.loginStatus = true;
					console.log(response.data);
					return "Succes";
					}
				catch(error: any) {
				//TODO improve error handling
				console.log(error);
				return error.response.data.message;		
			}
		},

		async userProfile(){
			const response = await axios
			.get("http://localhost:3000/auth/user-profile", {
				withCredentials: true
			  })
			  .catch((err) => {
				console.log(err);
				this.loginStatus = false;
				router.push('/');
			  });
		
			if (response && response.data) {
				console.log(response.data);
			  this.setUserProfile(response.data);
			}
		},
		async deactivate2FA(){
			const response = await axios
			.get("http://localhost:3000/auth/deactivate2FA", {
				withCredentials: true
			  })
			  .catch((err) => {
				console.log(err);
			  });
			  
			if (response && (response.status == 200)) {
				this.userProfile.activated2FA = false;
			}

		},

		async activate2FA(){
			this.userProfile.activated2FA = true;

		},

		async logout() {
			//TODO delete cookie and redirect
			const response = await axios.get("http://localhost:3000/auth/logout", {
				withCredentials: true
			}).catch((error) => {
				console.log(error);
			});
			if (response && response.data) {
				this.loginStatus = false;
			}
		}
		}

});
