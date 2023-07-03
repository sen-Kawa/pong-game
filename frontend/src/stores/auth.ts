import { defineStore } from 'pinia';
import axios from 'axios';
import { useStorage } from '@vueuse/core'

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
				}
			}),
	getters: {
		isLoggedIn() {
				if(this.loginStatus === false)
					return false;
				return true;
			},
		
		getUserName(state): string{
			return state.userProfile.userName
		} 
	},
	actions: {	
		setUserProfile(date: any){
			// const userProfile = {
			// 	id: date.id,
			// 	name: date.name,
			// 	user42Name: date.user42Name,
			// 	email: date.email,
			// }
			this.loginStatus = true;
			this.userProfile.id = date.userId;
			this.userProfile.userName = date.userName;
			this.userProfile.user42Name = date.user42Name;
			this.userProfile.email = date.email;
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
			  });
		
			if (response && response.data) {
			  this.setUserProfile(response.data);
			}
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
