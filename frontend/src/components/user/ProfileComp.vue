<template>
    <div class="profile">
        <h1>User Profile</h1>
        <p>Full name  : {{ authStore.getName }}</p>
        <p>42 User name  : {{ authStore.getUserName }}</p>
        <p>Player name: {{ authStore.getDisplayName }}</p>
        <p>Email      : {{ authStore.getEmail }}</p>
        <p>Avatar     : <img src="http://localhost:3000/users/userImage" width="50" height="60"></p>
        <p>
        <label for="tfa">
            Two-Factor Authentication enabled
            <input type="checkbox" id="tfa" name="tfa" value='false' onclick="return false;"/>
            <button @click="toogle2FA" type="button">{{ tfaButtonText }}</button>
        </label>

        </p>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useAuthStore } from '@/stores/auth'

    const authStore = useAuthStore()
    authStore.getuserProfile()

    let isTfa = ref(false)
    let tfaButtonText = ref('Enable')
    const playerName = ref('abc')

    // let res1: any = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/displayName`,
    //     {
    //       method: 'GET',
    //       mode: 'cors',
    //       credentials: 'include',
    //     //   headers: {
    //     //       "Content-Type": "application/json"
    //     //   },
    //     })
    // console.log("zzzzzzz ", res1)
    // let res2: any = await res1.json()
    // console.log("zzzzzzz ", res2.displayName)
    // // playerName.value = res2.displayName
    // console.log("zzzzzzz ", playerName.value)
   
   
    // let tfaCheckbox: any = document.querySelector('#tfa')
    // console.log("Checkbox ", document.querySelector('#tfa'))

    //let tfaMarker = ref('checked')
    // let listItems = []

    // isTfa.value = authStore.activated2FA

    async function toogle2FA() {
        console.log("toggle2FA", isTfa.value)
        if (isTfa.value === true) {
            await fetch(
                `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/deactivate2FA/`,
                    {
                        method: 'GET',
                        mode: 'cors',
                        credentials: 'include'
                    }
            )
            isTfa.value = false
            tfaButtonText.value = "Enable"
        }
        else {
            isTfa.value = true
            tfaButtonText.value = "Disable"
        }
    }

    // function getDisplayName(): string {
    //     let res1: any = fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/displayName`,
    //     {
    //       method: 'GET',
    //       mode: 'cors',
    //       credentials: 'include',
    //     //   headers: {
    //     //       "Content-Type": "application/json"
    //     //   },
    //     })
    //     let res2 = res1.json()
    //     // console.log("zzzzzzz ", res1.json())
    //     return 'abc'
    // }
    
    // if (isTfa.value === true) {
    //     tfaCheckbox.checked = true
    // } else {
    //     tfaCheckbox.checked = false
    // }
    
    // async function getData() {
    // //   const res: Response = await fetch(
    // //     `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/user-profile/`,
    // //     {
    // //       method: 'GET',
    // //       mode: 'cors',
    // //       credentials: 'include'
    // //       // headers: {
    // //       //     "Content-Type": "application/json"
    // //       // },
    // //     }
    // //   )
    // //   // console.log(res.text())
    // //   const finalRes = await res.json()
    // //   listItems = finalRes
    // //   // console.log(listItems)
    // //   displayName.value = listItems.name
    // //   // userName.value = listItems.login
    // //   userName.value = listItems.userName
    // //   isTfa.value = listItems.tfa
    // //   email.value = listItems.email
    // //   isTfa.value = authStore.activated2FA
    // //   let tfaCheckbox: any = document.querySelector('#tfa')
    // //   if (Boolean(isTfa.value) == true) {
    // //     tfaCheckbox.checked = true
    // //   } else {
    // //     tfaCheckbox.checked = false
    // //   }
    // }
    // getData()
    playerName.value = getDisplayName()
</script>


