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

    <div>
        <a v-bind:href=back_url>
            42 login
        </a>
    </div>
</div>
    </div>
</template>


<script setup lang="ts">
//TODO open 42 login in router-view
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia'
import router from '../router'


const authStore = useAuthStore();
const back_url = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/42login/`
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

</script>
