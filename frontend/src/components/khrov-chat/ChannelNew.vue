<script setup lang="ts">
import { reactive } from 'vue'
import ChannelNewItem from '@/components/khrov-chat/ChannelNewItem.vue'
import { layer } from '@layui/layer-vue'
import { useChatsStore } from '@/stores/chats'

const chatsStore = useChatsStore();

interface ChNewSearchOutput {
  id: number
  name: string
  desc: string
  visibility: string
  role: string
}

interface ChNew {
  chnLiFirstIsActive: boolean
  chnLiSecondIsActive: boolean
  chnNameInput: string
  chnVisiSelect: string
  chnPassInput: string
  chnPassValidatorField: string
  chnChPassLowercase: string
  chnChPassUppercase: string
  chnChPassNumber: string
  chnChPassLength: string
  chnDescInput: string
  chnError: string
  chnSearchInput: string
  renderSearchOutput: boolean
  chnSearchLoading: boolean
  suggestionsOutput: ChNewSearchOutput[]
  suggestionsOutputRef: number
  searchOutput: ChNewSearchOutput[]
  searchOutputRef: number
}
const chNew: ChNew = reactive({
  chnLiFirstIsActive: true,
  chnLiSecondIsActive: false,
  chnNameInput: '',
  chnVisiSelect: '',
  chnPassInput: '',
  chnPassValidatorField: '0px',
  chnChPassLowercase: 'chPassInvalid',
  chnChPassUppercase: 'chPassInvalid',
  chnChPassNumber: 'chPassInvalid',
  chnChPassLength: 'chPassInvalid',
  chnDescInput: '',
  chnError: '',
  chnSearchInput: '',
  renderSearchOutput: false,
  chnSearchLoading: false,
  suggestionsOutput: [],
  suggestionsOutputRef: 0,
  searchOutput: [],
  searchOutputRef: 0
})

const switchChnActive = (name: string) => {
  if (!name.match(/^first$|^second$/)) {
    return
  }
  chNew.chnLiFirstIsActive = name === 'first' ? true : false
  chNew.chnLiSecondIsActive = name === 'second' ? true : false
}

const chnPassValidator = () => {
  let lowerCase = /[a-z]/g
  let upperCase = /[A-Z]/g
  let numberIn = /[0-9]/g

  if (chNew.chnPassInput.match(lowerCase)) {
    chNew.chnChPassLowercase = 'chPassValid'
  } else {
    chNew.chnChPassLowercase = 'chPassInvalid'
  }

  if (chNew.chnPassInput.match(upperCase)) {
    chNew.chnChPassUppercase = 'chPassValid'
  } else {
    chNew.chnChPassUppercase = 'chPassInvalid'
  }

  if (chNew.chnPassInput.match(numberIn)) {
    chNew.chnChPassNumber = 'chPassValid'
  } else {
    chNew.chnChPassNumber = 'chPassInvalid'
  }

  if (chNew.chnPassInput.length >= 6) {
    chNew.chnChPassLength = 'chPassValid'
  } else {
    chNew.chnChPassLength = 'chPassInvalid'
  }
}

const requestChannelCreation = async () => {
  if (!String(chNew.chnNameInput).match(/^[a-zA-Z\d]{3,15}$/)) {
    chNew.chnError =
      '* Channel name must be between 3-15 characters long and contain only alphanumeric characters'
    return false
  } else if (!String(chNew.chnVisiSelect).match(/^public$|^private$|^password$/)) {
    chNew.chnError = '* A visibility option must be selected'
    return false
  }
  if (
    chNew.chnVisiSelect === 'password' &&
    !chNew.chnPassInput.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])^[a-zA-Z\d]{6,20}$/)
  ) {
    chNew.chnError = '* Please check password rules'
    return false
  } else if (!String(chNew.chnDescInput).match(/^[a-zA-Z\d?@ ,.'^\n]{10,42}$/)) {
    chNew.chnError =
      "* Channel description must be between 10-42 characters long, only Special chars ?@ ,.'^\n and Alphanumerics"
    return false
  } else {
    chNew.chnError = ''
  }
  let tmp = {
    name: chNew.chnNameInput,
    desc: chNew.chnDescInput,
    visibility: chNew.chnVisiSelect,
    password: ''
  }
  tmp.password = chNew.chnVisiSelect === 'password' ? chNew.chnPassInput : 'Aa1234'
  const response = await chatsStore.fetchForKhrov('/channels', 'POST', tmp);
  if (response) {
    try {
      if (!response.ok) {
        const error = await response.json()
        chNew.chnError = error.message
      } else {
        layer.msg(`Success. Channel ${chNew.chnNameInput} Created Successfully!`, { time: 5000 })
        chNew.chnNameInput = ''
        chNew.chnVisiSelect = ''
        chNew.chnPassInput = ''
        chNew.chnDescInput = ''
      }
    } catch {/* Do nothing */}
  }
}

const searchChannels = async (key: string) => {
  chNew.renderSearchOutput = true
  chNew.searchOutput = []
  chNew.searchOutputRef += 1
  chNew.chnSearchLoading = true
  if (key.length === 1) {
    return
  } else if (key.length === 0) {
    suggestedChannels()
    return
  }
  const response = await chatsStore.fetchForKhrov(`/channels/me/${key}`, 'GET', {});
  if (response) {
    try {
      chNew.chnSearchLoading = false
      if (!response.ok) throw response;
      const jsonObj = await response.json();
      chNew.searchOutput = jsonObj
      chNew.searchOutputRef += 1
    } catch {/* Do nothing */}
  }
}

const suggestedChannels = async () => {
  chNew.renderSearchOutput = false
  chNew.chnSearchLoading = true
  const response = await chatsStore.fetchForKhrov(`/channels/suggestions`, 'GET', {});
  if (response) {
    try {
      chNew.chnSearchLoading = false
      if (!response.ok) throw response;
      const jsonObj = await response.json();
      chNew.suggestionsOutput = jsonObj
      chNew.suggestionsOutputRef += 1 
    } catch {/* Do nothing */}
  }
}
suggestedChannels()
</script>

<template>
  <div class="Channel-new">
    <ul>
      <li :class="{ ChnActive: chNew.chnLiFirstIsActive }" @click="switchChnActive('first')">
        Find
      </li>
      <li :class="{ ChnActive: chNew.chnLiSecondIsActive }" @click="switchChnActive('second')">
        Create
      </li>
    </ul>
    <div>
      <div class="Ch-new-find Ch-new-out" :class="{ ChnActive: chNew.chnLiFirstIsActive }">
        <input
          class="Ch-nf-search-bar"
          placeholder="Search for Channels"
          @keyup="searchChannels(chNew.chnSearchInput)"
          @keyup.enter="searchChannels(chNew.chnSearchInput)"
          v-model="chNew.chnSearchInput"
        />
        <div
          class="Ch-nf-search-out Ch-nf-sub"
          :class="{ ChnfsActive: chNew.renderSearchOutput }"
          :key="chNew.searchOutputRef"
        >
          <p class="Chn-box-title">Search Results</p>
          <ChannelNewItem
            v-for="item in chNew.searchOutput"
            v-bind:key="item.id"
            :channelId="item.id"
            :channelName="item.name"
            :desc="item.desc"
            :visibility="item.visibility"
            :memberOr="item.role"
            @join-or-exit-complete="searchChannels(chNew.chnSearchInput)"
          />
        </div>
        <div
          class="Ch-nf-suggested Ch-nf-sub"
          :class="{ ChnfsActive: !chNew.renderSearchOutput }"
          :key="chNew.suggestionsOutputRef"
        >
          <p class="Chn-box-title">Suggested Channels</p>
          <ChannelNewItem
            v-for="item in chNew.suggestionsOutput"
            v-bind:key="item.id"
            :channelId="item.id"
            :channelName="item.name"
            :desc="item.desc"
            :visibility="item.visibility"
            :memberOr="item.role"
            @join-or-exit-complete="suggestedChannels()"
          />
        </div>
        <img
          v-if="chNew.chnSearchLoading"
          src="/khrov-chat-media/awaitingApi.gif"
          alt="Searching"
          class="Searching-loading"
        />
      </div>
      <div class="Ch-new-creat Ch-new-out" :class="{ ChnActive: chNew.chnLiSecondIsActive }">
        <p class="Chn-box-title">Create New Channel</p>
        <form @submit.prevent="requestChannelCreation" >
          <label for="chName">Channel Name:</label>
          <input
            type="text"
            class="chName"
            name="chName"
            placeholder="Set a channel name"
            minlength="3"
            maxlength="15"
            v-model="chNew.chnNameInput"
            pattern="^[a-zA-Z\d]{3,15}$"
            title="Channel name must be between 3-15 characters long and contain only alphanumeric characters"
            required
          />
          <label for="chVisi">Channel Visibility:</label>
          <select name="chVisi" class="chVisi" v-model="chNew.chnVisiSelect" required>
            <option disabled :value="''">Channel Visibility</option>
            <option :value="'public'">Public</option>
            <option :value="'private'">Private</option>
            <option :value="'password'">Password</option>
          </select>
          <div v-if="chNew.chnVisiSelect === 'password'">
            <input
              type="password"
              class="chPass"
              name="chPass"
              placeholder="Set a channel password"
              @focus="chNew.chnPassValidatorField = '100px'"
              @blur="chNew.chnPassValidatorField = '0px'"
              @keyup="chnPassValidator"
              v-model="chNew.chnPassInput"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}"
              title="Must contain at least a number, an uppercase and lowercase letter, and at least 6 or more characters"
              minlength="6"
              maxlength="20"
              required
            />
            <div id="ChPassVali">
              <span>Password must contain the following:</span>
              <p id="ChnLowercase" :class="chNew.chnChPassLowercase">A <b>lowercase</b> letter</p>
              <p id="ChnUppercase" :class="chNew.chnChPassUppercase">An <b>uppercase</b> letter</p>
              <p id="ChnNumber" :class="chNew.chnChPassNumber">A <b>number</b></p>
              <p id="ChnLength" :class="chNew.chnChPassLength">Minimum <b>6 characters</b></p>
            </div>
          </div>
          <label for="chDesc">Channel Description:</label>
          <textarea
            class="chDesc"
            name="chDesc"
            rows="4"
            cols="25"
            minlength="10"
            maxlength="42"
            v-model="chNew.chnDescInput"
            pattern="^[a-zA-Z\d?@ ,.'^\n]{10,42}$"
            title="Channel description must be between 10-42 characters long, only Special chars ?@ ,.\'^\n and Alphanumerics"
            required
          ></textarea>
          <p class="Ch-form-error-msg" v-if="chNew.chnError.length > 0">{{ chNew.chnError }}</p>
          <input
            type="submit"
            class="chSubmit"
            value="Create Channel"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.Channel-new {
  display: grid;
  grid-template-rows: 25px auto;

  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
}
.Channel-new > ul:nth-child(1) {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.Channel-new > ul:nth-child(1) > li {
  display: inline-block;
  background-color: #d7e1ec;
  position: relative;
  top: -1px;
  width: 50%;
  height: 99%;
  padding: 0;
  font-size: 14px;
  color: #009900;
  text-align: center;
  -webkit-transition: 0.5s;
  transition: 0.5s;
  cursor: pointer;
}
.Channel-new > :nth-child(1) > li:hover,
.Channel-new > :nth-child(1) > li:active,
.Channel-new > :nth-child(1) > li.ChnActive {
  background-color: #f5f5dc;
}

.Ch-new-out {
  display: none;
}
.Ch-new-out.ChnActive {
  display: block;
}

.Channel-new > :nth-child(2) {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.Channel-new > :nth-child(2)::-webkit-scrollbar {
  display: none;
}

.Ch-new-find {
  position: relative;
  height: 100%;
  width: 100%;
  margin: 0;
  margin-top: 0;
  padding-left: 10px;
  background-color: rgb(245, 245, 245);
}
.Ch-nf-search-bar {
  display: block;
  width: 90%;
  height: 25px;
  margin: 12px auto 5px;
  border: none;
  border-radius: 10px;
  padding: 5px 10px;
  box-shadow: 0 0 5px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Search-box:focus,
.Search-box:hover {
  box-shadow: 0 0 10px #73c2fb;
}
.Ch-nf-sub {
  display: none;
}
.Ch-nf-sub.ChnfsActive {
  display: block;
}
.Chn-box-title {
  display: block;
  width: 100%;
  overflow: hidden;
  margin-top: 10px;
  text-align: center;
}
.Searching-loading {
  display: block;
  height: 90px;
  width: 120px;
  margin: 2px auto;
}

.Ch-new-creat {
  position: relative;
  height: 100%;
  width: 100%;
  margin: 0;
  margin-top: 0;
  padding-left: 10px;
  background-color: rgb(245, 245, 245);
}
.Ch-new-creat > p:nth-child(1) {
  display: block;
  padding: 5px 0;
}
.Ch-new-creat > :nth-child(1) {
}

.Ch-new-creat > form {
  padding-left: 10px;
  font-size: 10px;
}
.chName {
  display: block;
  width: 70%;
  height: 15px;
  font-size: 10px;
  margin: 2px 0 5px;
  border: none;
  border-radius: 10px;
  padding-left: 10px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.chName:focus,
.chName:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.chVisi {
  display: block;
  width: 70%;
  height: 15px;
  font-size: 10px;
  margin: 2px 0 5px;
  border: none;
  border-radius: 5px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.chVisi:focus,
.chVisi:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.chPass {
  display: block;
  width: 70%;
  height: 15px;
  font-size: 10px;
  margin: 2px 0 5px;
  border: none;
  border-radius: 10px;
  padding-left: 10px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.chPass:focus,
.chPass:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.chDesc {
  display: block;
  width: 70%;
  height: 100%;
  font-size: 10px;
  margin: 2px 0 5px;
  border: none;
  border-radius: 10px;
  padding-left: 10px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.chDesc:focus,
.chDesc:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.chSubmit {
  display: block;
  font-size: 10px;
  margin: 10px 0 5px 5px;
  border: none;
  border-radius: 10px;
  padding: 5px;
  cursor: pointer;
  box-shadow: 0 0 2px #73c2fb;
  -webkit-transition: 0.5s;
  transition: 0.5s;
}
.chSubmit:focus,
.chSubmit:hover {
  box-shadow: 0 0 5px #73c2fb;
}

#ChPassVali {
  display: block;
  width: 90%;
  height: v-bind('chNew.chnPassValidatorField');
  overflow: hidden;
  position: relative;
  margin: 5px;
  font-size: 12px;
  background-color: #f5f5dc;
  border-radius: 10px;
  padding-left: 5px;
  -webkit-transition: 0.5s;
  transition: 0.5s;
}
#ChPassVali > span {
  font-weight: 700;
}
#ChPassVali > p {
  padding-left: 15px;
}
.chPassInvalid {
  color: red;
}
.chPassInvalid:before {
  position: relative;
  left: -15px;
  content: '✖';
}
.chPassValid {
  color: green;
}
.chPassValid:before {
  position: relative;
  left: -15px;
  content: '✔';
}
.Ch-form-error-msg {
  display: block;
  width: 90%;
  padding: 5px;
  font-size: 12px;
  font-weight: 500;
  color: red;
  background-color: #f5f5dc;
}
</style>
