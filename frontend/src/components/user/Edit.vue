<template>
   <div>
        <h4 class="text-center mt-20">
         <small>
         <button class="btn btn-success" v-on:click="navigate()"> View All userss </button>
         </small>
        </h4>
        <div class="col-md-12 form-wrapper">
          <h2> Edit users </h2>
          <form id="create-post-form" @submit.prevent="editusers">
               <div class="form-group col-md-12">
                <label for="title"> First Name </label>
                <input type="text" id="first_name" v-model="users.firstName" name="title" class="form-control" placeholder="Enter firstname">
               </div>
               <div class="form-group col-md-12">
                <label for="title"> Last Name </label>
                <input type="text" id="last_name" v-model="users.lastName" name="title" class="form-control" placeholder="Enter Last name">
               </div>
              <div class="form-group col-md-4 pull-right">
                  <button class="btn btn-success" type="submit"> Edit users </button>
              </div>           </form>
        </div>
    </div>
</template>
<script>
import { server } from "../../helper";
import axios from "axios";
import router from "../../router";
export default {
  data() {
    return {
      id: 0,
      users: {}
    };
  },
  created() {
    this.id = this.$route.params.id;
    this.getusers();
  },
  methods: {
    editusers() {
      let usersData = {
        first_name: this.users.first_name,
        last_name: this.users.last_name,
      };
      axios
        .put(
          `${server.baseURL}/users/update?usersID=${this.id}`,
          usersData
        )
        .then(data => {
          router.push({ name: "home" });
        });
    },
    getusers() {
      axios
        .get(`${server.baseURL}/users/users/${this.id}`)
        .then(data => (this.users = data.data));
    },
    navigate() {
      router.go(-1);
    }
  }
};
</script>
