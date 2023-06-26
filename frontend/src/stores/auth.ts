import { defineStore } from 'pinia';

const baseUrl = `${import.meta.env.VUE_APP_BACKEND_SERVER_URI}/auth/login`;

export const useAuthStore = defineStore( 'user', {
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: JSON.parse(localStorage.getItem('user')!),
    }),

	actions: {
		async login(username: string, password: string) {
			const body = JSON.stringify({ "name": username, "password": password });
			fetch(baseUrl, 
			{
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json'
				},
				body: body
			  }
				
			).then(res => res.json())
			.then(res => console.log(res))

		},
		logout() {
			this.user = null;
			localStorage.removeItem('user');
		}
	}
});
