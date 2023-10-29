<template>
  <div class="validation-form">
    <p class="component-title">Validate yourself with your Auth App code</p>
    <Form id="twoFactor" @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }">
      <div class="form-group">
        <label class="details">Code:</label>
        <Field
          id="inputField"
          name="codeValue"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.codeValue }"
        />
      </div>
      <div class="form-group">
        <button>Submit</button>
      </div>
      <p v-if="errors.codeValue" class="invalid-feedback">{{ errors.codeValue }}</p>
      <p v-if="errors.apiError" class="invalid-api">{{ errors.apiError }}</p>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as Yup from 'yup'
import { useAuthStore } from '@/stores/auth'
const AuthStore = useAuthStore()

const schema = Yup.object().shape({
  codeValue: Yup.string().required('Code is required')
})

async function onSubmit(values: any, { setErrors }: any) {
  const { codeValue } = values
  const stuff = await AuthStore.validate2fa(codeValue)
  setErrors({ apiError: stuff })
}
</script>
