<template>
  <div class="component-title">First time log in</div>
  <div class="component-subtitle">Set display name</div>
  <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
    <div class="form-group">
      <label class="details">Choose a Display name: </label>
      <Field
        name="displayName"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': errors.username }"
      />
      <div class="invalid-feedback">{{ errors.username }}</div>
    </div>
    <div class="form-group">
      <button class="btn btn-primary" :disabled="isSubmitting">
        <span v-show="isSubmitting"></span>
        Login
      </button>
    </div>
    <div v-if="errors.apiError">{{ errors.apiError }}</div>
  </Form>
  <div></div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as Yup from 'yup'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const schema = Yup.object().shape({
  displayName: Yup.string().required('Name is required')
})

async function onSubmit(values: any, { setErrors }: any) {
  const { displayName } = values
  const stuff = await authStore.setDisplayName(displayName)
  setErrors({ apiError: stuff })
}
</script>
