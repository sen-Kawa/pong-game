import { defineStore } from 'pinia';
import axios from 'axios';

// const baseUrl = `${import.meta.env.VUE_APP_BACKEND_SERVER_URI}/auth/login`;

export const useAuthStore = defineStore( 'user', {
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: JSON.parse(localStorage.getItem('user')!),
    }),

	actions: {
		async login(username: string, password: string) {
			const body = { "name": username, "password": password };
			axios.post('http://localhost:3000/auth/login', body,  {
				headers: {
				  'Content-Type': 'application/json'
				}
			  }
				
			).then(function(response) {
				console.log(response.data);
			})
			.catch(function(error) {
				console.log(error)
			})

		},
		logout() {
			this.user = null;
			localStorage.removeItem('user');
		}
	}
});
