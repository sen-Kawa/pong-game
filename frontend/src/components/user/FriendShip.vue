<template>
<Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
	<div class="form-group">
		<label>Username of friend</label>
		<Field name="username" type="text" class="form-control" :class="{ 'is-invalid': errors.username }" />
		<div class="invalid-feedback">{{errors.username}}</div>
	</div>
	<div class="form-group">
                <button class="btn btn-primary" :disabled="isSubmitting">
                    <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                    Add User as Friend
                </button>
            </div>
    <div v-if="errors.apiError">{{errors.apiError}}</div>


</Form>
</template>

<script setup lang="ts">

import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import axios from 'axios';
const schema = Yup.object().shape({
    username: Yup.string().required('Username is required')
});
const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users/`;

async function onSubmit(values: any, { setErrors } : any) {
    console.log(values.username);
	const body = { "friend-name": values.username };
				try {
					const response = await axios.post(baseUrl + "addFriend", body,  {
						headers: {
				  		'Content-Type': 'application/json'
						},
						withCredentials: true
			  		});
					console.log(response)
					//console.log(response.data);
					//return "Succes";
					}
				catch(error: any) {
				//TODO improve error handling
				console.log(error);
				setErrors({apiError: error.response.data.message});	
			}
    // const stuff = await authStore.login(username, password);
    // setErrors({apiError: stuff})
}


</script>