import { defineStore } from 'pinia';
import axios from 'axios';


const baseUrl = `${import.meta.env.VUE_APP_BACKEND_SERVER_URI}/auth/login`;

export const useAuthStore = defineStore('auth', {

		state: () =>({
        user : localStorage.getItem('user'),
		accessToken : localStorage.getItem('token'),
		userId : localStorage.getItem('userId')
		}),
		getters: {
			isLoggedIn: (state) => {
				if(state.accessToken === null)
					return false;
				return true;
			}
		},
		actions: {
			

			async login(username: string, password: string) {
			const self=this;
			const body = { "name": username, "password": password };
			axios.post('http://localhost:3000/auth/login', body,  {
				headers: {
				  'Content-Type': 'application/json'
				}
			  }
				
			).then(function(response) {
				self.user = response.data.user;
				self.accessToken = response.data.accessToken;
				self.userId = response.data.userId;
				localStorage.setItem('token', response.data.accessToken);
				localStorage.setItem('user', response.data.user);
				localStorage.setItem('userId', response.data.userId);
				console.log(response.data);
			})
			.catch(function(error) {
				console.log(error)
			})

		},
		logout() {
			this.user = null;
			this.accessToken = null;
			this.userId = null;
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			localStorage.removeItem('userId');
		}
		}

});
