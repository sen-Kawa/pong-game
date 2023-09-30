<template>
  <div v-if="!isLoggedIn">
    <div>
      <a v-bind:href="back_url"> 42 login </a>
    </div>
  <!--  <p>Fake login for testing</p>
   <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
      <div class="form-group">
        <label>User Id</label>
        <Field
          name="username"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.username }"
        />
        <div class="invalid-feedback">{{ errors.username }}</div>
      </div>
      <div class="form-group">
        <button class="btn btn-primary" :disabled="isSubmitting">
          <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
          Login
        </button>
      </div>
      <div v-if="errors.apiError">{{ errors.apiError }}</div>
    </Form> -->
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'

//TODO fake login for chat testing
// import { Form, Field } from 'vee-validate'
// import * as Yup from 'yup'
// const schema = Yup.object().shape({
//   username: Yup.string().required('Username is required')
// })

// async function onSubmit(values: any, { setErrors }: any) {
//   const { username } = values
//   const stuff = await authStore.login(username)
//   setErrors({ apiError: stuff })
// }


const authStore = useAuthStore()
const back_url = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/42login/`
const { isLoggedIn } = storeToRefs(authStore)
</script>
