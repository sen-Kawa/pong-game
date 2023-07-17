<template>
    <div v-if="!isLoggedIn ">
        <h2>Login</h2>
        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
            <div class="form-group">
                <label>Username</label>
                <Field name="username" type="text" class="form-control" :class="{ 'is-invalid': errors.username }" />
                <div class="invalid-feedback">{{errors.username}}</div>
            </div>            
            <div class="form-group">
                <label>Password</label>
                <Field name="password" type="password" class="form-control" :class="{ 'is-invalid': errors.password }" />
                <div class="invalid-feedback">{{errors.password}}</div>
            </div>            
            <div class="form-group">
                <button class="btn btn-primary" :disabled="isSubmitting">
                    <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                    Login
                </button>
            </div>
            <div v-if="errors.apiError">{{errors.apiError}}</div>
        </Form>
    <div>
    <button
      class="btn btn-primary"
      role="button"
      v-on:click="loginFortyTwo"
    > 42 Login
    </button>
</div>
    </div>
</template>


<script setup lang="ts">

import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia'
import router from '../router'
import { openSignInWindow } from '../components/user/AuthPopup';


const authStore = useAuthStore();

const { isLoggedIn } = storeToRefs(authStore)
const schema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
});

async function onSubmit(values: any, { setErrors } : any) {
    const { username, password } = values;
    const stuff = await authStore.login(username, password);
    setErrors({apiError: stuff})
}

const receiveMessageFortyTwo = async (event: MessageEvent<any>) => {
    console.log(event);
  window.removeEventListener('message', receiveMessageFortyTwo);
  await authStore.signInFortyTwo(event.data);
  
  
};

const loginFortyTwo = async () => {

         window.addEventListener('message', receiveMessageFortyTwo);
         openSignInWindow(`${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/42login/`);
};



</script>
