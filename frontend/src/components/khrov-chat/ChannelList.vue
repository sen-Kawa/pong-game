<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue'
import ChannelListItem from '@/components/khrov-chat/ChannelListItem.vue'
import ChannelListItemMsg from '@/components/khrov-chat/ChannelListItemMsg.vue'
import ChannelListItemPendings from '@/components/khrov-chat/ChannelListItemPendings.vue'
import type { 
  ChnListOfflineCache, 
  ChnListChannConn,
} from '@/components/khrov-chat/interface/khrov-chat'
import { useChatsStore } from '@/stores/chats'
import { useChannelListStore } from '@/stores/channelList'
import { socket } from '@/sockets/sockets'

const chatsStore = useChatsStore()
const chnlstStore = useChannelListStore()




const channCache: any = reactive({})
const offlineCache: ChnListOfflineCache[] = []


const calculateChannNotif = (channConn: ChnListChannConn[]): number => {
  let total: number = 0;
  for (let key in channConn) {
    const oneChann = channConn[key];
    total += oneChann.unreadCount;
  }
  return total ;
}

watch(() => chnlstStore.getChList.notifDiff, async (curr, expired) => {
  if (curr > expired) {
    let there_be_sounds = new Audio(chatsStore.getKhrovCelestial);  
    there_be_sounds.play();
    chatsStore.manageAllNotifCounter(0, curr);
  }
})
const getChannelPreviews = async () => {
  const response = await chatsStore.fetchForKhrov(`/channels/get/connections/get`, 'GET', {});
  if (response) {
    try {
      if (!response.ok) throw response;
      const jsonObj = await response.json();
      if (JSON.stringify(jsonObj) != JSON.stringify(chnlstStore.getChList.channConn)) {
        chnlstStore.getChList.channConn = jsonObj
        chnlstStore.getChList.notifDiff = calculateChannNotif(chnlstStore.getChList.channConn);
      }
      if (chnlstStore.getChList.chlIdOfFocus != 0) {
        getFocusedChannelHistory()
      }
    } catch {/* Do nothing */}
  }
}

const getFocusedChannelHistory = async () => {
  const response = await chatsStore.fetchForKhrov(`/channels/get/connections/chann/${chnlstStore.getChList.chlIdOfFocus}`, 'GET', {});
  if (response) {
    try {
      if (!response.ok) {
        chnlstStore.getChList.chlIdOfFocus = 0;
        throw response;
      }
      const jsonObj = await response.json();
      if (!offlineCache.length &&
          JSON.stringify(jsonObj) != JSON.stringify(channCache[chnlstStore.getChList.chlIdOfFocus])) {
        channCache[chnlstStore.getChList.chlIdOfFocus] = jsonObj
      }
    } catch {/* Do nothing */}
  }
}

const submitChannMsg = async () => {
  if ( !chnlstStore.getChList.chlMsgInput ||
     ( chnlstStore.getChList.chlMsgInput && (chnlstStore.getChList.chlMsgInput.trimStart()).length == 0) ) {
    return
  }
  const offlineAppend = {
    outgoing: chnlstStore.getChList.chlMsgInput as string,
    createdAt: new Date().toISOString(),
    deliveryStatus: 'pending',
    user: {
      userName: 'ME'
    }
  }
  channCache[chnlstStore.getChList.chlIdOfFocus] = [offlineAppend, ...channCache[chnlstStore.getChList.chlIdOfFocus]]
  const tmp = {
    chId: chnlstStore.getChList.chlIdOfFocus,
    msg: chnlstStore.getChList.chlMsgInput as string,
    time: new Date().toISOString()
  }
  offlineCache.push(tmp)
  chnlstStore.getChList.chlMsgInput = ''
  const response = await chatsStore.fetchForKhrov('/channels', 'PUT', offlineCache);
  if (response) 
    if (response.ok)
      offlineCache.length = 0;
}

const setSeen = async (chId: number) => {
  const tmp = {
    chId: chId
  }
  await chatsStore.fetchForKhrov(`/channels/put/set-seen`, 'PUT', tmp);
}

onMounted(() => {
  getChannelPreviews();
  socket.on('new-channel-event', (id: number) => {
    const found = chnlstStore.getChList.channConn.find((element) => element.chId===id)
    if (found !== undefined || id === 0) {
      getChannelPreviews();
    }
  })
})

const changeActiveBox = (name: string) => {
  if (!name.match(/^Chl-item$|^Chl-msgs$|^Chl-mod$/)) {
    return
  }

  chnlstStore.getChList.chlItemActive = name === 'Chl-item' ? true : false
  chnlstStore.getChList.chlMsgsActive = name === 'Chl-msgs' ? true : false
  chnlstStore.getChList.chlModActive = name === 'Chl-mod' ? true : false
}

const visibilityToImage = (visibility: string): string => {
  if (!visibility.match(/^public$|^private$|^password$/)) {
    return ''
  }
  let visImage: string = '/khrov-chat-media/Channel.png'
  if (visibility === 'public') {
    return visImage.substring(0, 18) + 'public' + visImage.substring(18)
  } else if (visibility === 'private') {
    return visImage.substring(0, 18) + 'private' + visImage.substring(18)
  }
  return visImage.substring(0, 18) + 'password' + visImage.substring(18)
}

const getUserID = async (userNameInput: string) => {
  chnlstStore.getChList.notifMsg = ''
  if (!userNameInput || userNameInput.length < 3) {
    chnlstStore.getChList.notifMsg = 'Input in "userName" must be more than 3 chars'
    return
  }
  const response = await chatsStore.fetchForKhrov(`/channels/?chId=${chnlstStore.getChList.chlIdOfFocus}&userName=${userNameInput}`, 'GET', {});
  if (response) {
    try {
      if (!response.ok) throw response;
      chnlstStore.getChList.modGetUserIdInput = ''
      const jsonObj = await response.json();
      chnlstStore.getChList.notifMsg = jsonObj.message
    } catch {/* Do nothing */}
  }
}

const moderateMembers = async () => {
  chnlstStore.getChList.notifModerMsg = ''

  if (!parseInt(chnlstStore.getChList.modModerMemberId) || parseInt(chnlstStore.getChList.modModerMemberId) < 1) {
    chnlstStore.getChList.notifModerMsg = 'Input in "member Id" must be greater than 0'
    return
  }

  if (!chnlstStore.getChList.modModerSelectAction) {
    chnlstStore.getChList.notifModerMsg = 'Please select an option under "Select Action"'
    return
  }

  if (chnlstStore.getChList.modModerSelectAction === 'mute' && !chnlstStore.getChList.modModerMuteMins) {
    chnlstStore.getChList.notifModerMsg = 'Please enter number of minutes to mute'
    return
  }

  const muteTime = parseInt(chnlstStore.getChList.modModerMuteMins) ? parseInt(chnlstStore.getChList.modModerMuteMins) : 0
  const currentTime = new Date()
  const mutedUntil = new Date(currentTime.getTime() + 1000 * 60 * muteTime)

  const tmp = {
    chId: chnlstStore.getChList.chlIdOfFocus,
    userId: parseInt(chnlstStore.getChList.modModerMemberId),
    action: chnlstStore.getChList.modModerSelectAction,
    mutedUntil: mutedUntil.toISOString()
  }

  const response = await chatsStore.fetchForKhrov(`/channels/put/channel/moderate`, 'PUT', tmp);
  if (response) {
    try {
      if (!response.ok) throw response;
      chnlstStore.getChList.modModerMemberId = ''
      chnlstStore.getChList.modModerSelectAction = ''
      chnlstStore.getChList.modModerMuteMins = ''
      const jsonObj = await response.json();
      chnlstStore.getChList.notifModerMsg = jsonObj.message
    } catch {/* Do nothing */}
  }
}

const modifyChannel = async () => {
  chnlstStore.getChList.notifModifyMsg = ''

  if (!chnlstStore.getChList.modModifySelectVisi.match(/^public$|^private$|^password$/)) {
    chnlstStore.getChList.notifModifyMsg = 'Please Select a Channel Visibility Option!'
    return
  }
  if (
    chnlstStore.getChList.modModifySelectVisi === 'password' &&
    !chnlstStore.getChList.modModifyPwd.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])^[a-zA-Z\d]{6,20}$/)
  ) {
    chnlstStore.getChList.notifModifyMsg =
      'Password must contain an Uppercase, Lowercase and Decimal. Length must be between 6 - 20 chars.'
    return
  }

  const passTmp = chnlstStore.getChList.modModifySelectVisi === 'password' ? chnlstStore.getChList.modModifyPwd : 'Abc123'

  const tmp = {
    chId: chnlstStore.getChList.chlIdOfFocus,
    newVisibility: chnlstStore.getChList.modModifySelectVisi,
    password: passTmp
  }

  const response = await chatsStore.fetchForKhrov('/channels/put/channel/moderate/modify', 'PUT', tmp);
  if (response) {
    try {
      if (!response.ok) throw response;
      chnlstStore.getChList.modModifySelectVisi = ''
      chnlstStore.getChList.modModifyPwd = ''
      const jsonObj = await response.json();
      chnlstStore.getChList.notifModifyMsg = jsonObj.message
    } catch {/* Do nothing */}
  }
}

const getAllPending = async () => {
  chnlstStore.getChList.getPendingsObj.length = 0

  const response = await chatsStore.fetchForKhrov(`/channels/get/channel/moderate/true/${chnlstStore.getChList.chlIdOfFocus}`, 'GET', {});
  if (response) {
    try {
      if (!response.ok) throw response;
      const jsonObj = await response.json();
      chnlstStore.getChList.getPendingsObj = jsonObj
      chnlstStore.getChList.getPendingsObjRef += 1
    } catch {/* Do nothing */}
  }
}

const approveOrReject = async (choice: boolean, memberId: number) => {
  const tmp = {
    chId: chnlstStore.getChList.chlIdOfFocus,
    memberId: memberId,
    action: choice
  }
  const response = await chatsStore.fetchForKhrov('/channels/put/channel/moderate/pending/decide', 'PUT', tmp);
  if (response && response.ok) getAllPending();
}
</script>

<template>
  <div class="Channel-list">
    <p class="Empty-channel-list" v-if="chnlstStore.getChList.channConn.length===0">
      No Channel Conversations to display!
    </p>
    <div
      class="Chl-item Chl-box"
      :class="{ ChlActive: chnlstStore.getChList.chlItemActive }"
      v-if="chnlstStore.getChList.channConn.length > 0"
    >
      <ChannelListItem
        v-for="item in chnlstStore.getChList.channConn"
        v-bind:key="item.chId"
        :channelId="item.chId"
        :role="item.role"
        :unread="item.unreadCount"
        :channelName="item.ch.name"
        :desc="item.ch.desc"
        :visibility="visibilityToImage(item.ch.visibility)"
        @click="
          {
            chnlstStore.getChList.chlVisibilityOfFocus = visibilityToImage(item.ch.visibility);

            chnlstStore.getChList.chlIdOfFocus = item.chId;

            chnlstStore.getChList.chlNameOfFocus = item.ch.name;

            chnlstStore.getChList.chlDescOfFocus = item.ch.desc;

            chnlstStore.getChList.chlRoleOfFocus = item.role;

            chnlstStore.getChList.linkStatusOfFocus = item.linkStatus;

            chnlstStore.getChList.mutedUntilOfFocus = item.mutedUntil;

            changeActiveBox('Chl-msgs');

            getChannelPreviews();
            setSeen(chnlstStore.getChList.chlIdOfFocus);
            chatsStore.manageAllNotifCounter(0, 0, 'channel');

          }"
      />
    </div>
    <div class="Chl-msgs Chl-box" :class="{ ChlActive: chnlstStore.getChList.chlMsgsActive }">
      <div class="Chl-msgs-header">
        <span
          @click="{
              changeActiveBox('Chl-item');

              chnlstStore.getChList.chlMsgOrModerate = true;

              setSeen(chnlstStore.getChList.chlIdOfFocus);
            }
          "
          >&#11164;</span
        >
        <img :src="chnlstStore.getChList.chlVisibilityOfFocus" alt="Visibility" />
        <div>
          <p>{{ chnlstStore.getChList.chlNameOfFocus }}</p>
          <p>{{ chnlstStore.getChList.chlDescOfFocus }}</p>
        </div>
        <img
          :src="
            chnlstStore.getChList.chlMsgOrModerate === true
              ? '/khrov-chat-media/moderation.png'
              : '/khrov-chat-media/messages.png'
          "
          alt="Moderate"
          v-if="chnlstStore.getChList.chlRoleOfFocus.match(/^owner$|^admin$/)"
          @click="{
              if (chnlstStore.getChList.chlMsgOrModerate === true) {
                chnlstStore.getChList.chlMsgOrModerate = false;
              } else {
                chnlstStore.getChList.chlMsgOrModerate = true;
              }
            }"
        />
      </div>
      <div class="Chl-msgs-body C-m-b-msgs" :class="{ CmbActive: chnlstStore.getChList.chlMsgOrModerate }">
        <!-- only create if the channelID exists as a cache in channelsCache  -->
        <!-- v-if the channelId of channel under focus already exists as a key in channCache -->
        <div
          class="Channel-messages"
          :key="channCache[chnlstStore.getChList.chlIdOfFocus]"
          v-if="chnlstStore.getChList.chlIdOfFocus in channCache"
        >
          <ChannelListItemMsg
            v-for="item in channCache[chnlstStore.getChList.chlIdOfFocus]"
            v-bind:key="item"
            :name="item.user.userName"
            :msg="item.outgoing"
            :time="item.createdAt"
            :status="item.deliveryStatus"
          />
        </div>
        <!-- rendered if it is channel owner or if the linkStatus not same as 'muted' -->
        <div
          class="New-channel-msg-input"
          v-if="chnlstStore.getChList.chlRoleOfFocus === 'owner' || chnlstStore.getChList.linkStatusOfFocus != 'muted'"
        >
          <input
            type="text"
            class="Channel-msg-box"
            v-model="chnlstStore.getChList.chlMsgInput"
            @keyup.enter="submitChannMsg"
          />
          <span class="Channel-msg-send" @click="submitChannMsg">&#11166;</span>
        </div>
        <!-- rendered if user is muted and they are not channel owner -->
        <div
          class="New-channel-msg-input"
          v-if="chnlstStore.getChList.chlRoleOfFocus != 'owner' && chnlstStore.getChList.linkStatusOfFocus === 'muted'"
        >
          <button class="I-am-muted">
            <img src="/khrov-chat-media/muted.png" alt="Muted" />
            <span>Until {{ chnlstStore.getChList.mutedUntilOfFocus }} </span>
          </button>
        </div>
      </div>
      <div class="Chl-msgs-body C-m-b-moderate" :class="{ CmbActive: !chnlstStore.getChList.chlMsgOrModerate }">
        <div class="Channel-moderate">
          <button
            @click="
              {
                if (chnlstStore.getChList.modGetUserIdArrowRotate === 'rotate(0deg)') {
                  chnlstStore.getChList.modGetUserIdBoxDisplayToggle = '80px';
                  chnlstStore.getChList.modGetUserIdArrowRotate = 'rotate(90deg)';
                } else {
                  chnlstStore.getChList.modGetUserIdBoxDisplayToggle = '0px';
                  chnlstStore.getChList.modGetUserIdArrowRotate = 'rotate(0deg)';
                }
              }
            "
          >
            <svg fill="none" viewBox="0 0 16 16" width="12" height="12">
              <path
                fill="#000"
                fill-rule="evenodd"
                d="M5 2v12l6-6.001L5 2Z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Get User ID
          </button>
          <div>
            <input
              type="text"
              class="Chn-mod-get-id-input"
              placeholder="Enter userName"
              v-model="chnlstStore.getChList.modGetUserIdInput"
              @keyup.enter="getUserID(chnlstStore.getChList.modGetUserIdInput)"
            />
            <p class="Chn-mod-get-id-msg" v-if="chnlstStore.getChList.notifMsg">{{ chnlstStore.getChList.notifMsg }}</p>
          </div>

          <button
            @click=";
              {
                if (chnlstStore.getChList.modMakeUserAdminArrowRotate === 'rotate(0deg)') {
                  chnlstStore.getChList.modMakeUserAdminBoxDisplayToggle = '150px';
                  chnlstStore.getChList.modMakeUserAdminArrowRotate = 'rotate(90deg)';
                } else {
                  chnlstStore.getChList.modMakeUserAdminBoxDisplayToggle = '0px';
                  chnlstStore.getChList.modMakeUserAdminArrowRotate = 'rotate(0deg)';
                }
              }
            "
          >
            <svg fill="none" viewBox="0 0 16 16" width="12" height="12">
              <path
                fill="#000"
                fill-rule="evenodd"
                d="M5 2v12l6-6.001L5 2Z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Moderate Members
          </button>
          <div>
            <input
              type="number"
              class="Chn-mod-moder-member-id"
              placeholder="Enter member ID"
              v-model="chnlstStore.getChList.modModerMemberId"
            />
            <select v-model="chnlstStore.getChList.modModerSelectAction" class="Chn-mod-moder-select-action">
              <option disabled selected :value="''">Select Action</option>
              <option :value="'setAsAdmin'" v-if="chnlstStore.getChList.chlRoleOfFocus === 'owner'">
                Assign Admin Role
              </option>
              <option :value="'ban'">Ban</option>
              <option :value="'kick'">Kick</option>
              <option :value="'mute'">Mute</option>
            </select>
            <input
              type="number"
              class="Chn-mod-moder-mute-mins"
              v-if="chnlstStore.getChList.modModerSelectAction === 'mute'"
              placeholder="Mute for N minutes"
              v-model="chnlstStore.getChList.modModerMuteMins"
            />
            <button class="Chn-mod-moder-submit" @click="moderateMembers()">Submit</button>
            <p class="Chn-mod-moder-msg" v-if="chnlstStore.getChList.notifModerMsg">{{ chnlstStore.getChList.notifModerMsg }}</p>
          </div>

          <button
            v-show="chnlstStore.getChList.chlRoleOfFocus === 'owner'"
            @click="
              {
                if (chnlstStore.getChList.modModifyChannelArrowRotate === 'rotate(0deg)') {
                  chnlstStore.getChList.modModifyChannelBoxDisplayToggle = '160px';
                  chnlstStore.getChList.modModifyChannelArrowRotate = 'rotate(90deg)';
                } else {
                  chnlstStore.getChList.modModifyChannelBoxDisplayToggle = '0px';
                  chnlstStore.getChList.modModifyChannelArrowRotate = 'rotate(0deg)';
                }
              }
            "
          >
            <svg fill="none" viewBox="0 0 16 16" width="12" height="12">
              <path
                fill="#000"
                fill-rule="evenodd"
                d="M5 2v12l6-6.001L5 2Z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Modify Channel
          </button>
          <div v-show="chnlstStore.getChList.chlRoleOfFocus === 'owner'">
            <select v-model="chnlstStore.getChList.modModifySelectVisi" class="Chn-mod-modify-select-visi">
              <option disabled selected :value="''">Select Visibility</option>
              <option :value="'public'">Public</option>
              <option :value="'private'">Private</option>
              <option :value="'password'">Password</option>
            </select>
            <input
              type="text"
              class="Chn-mod-modify-password"
              v-if="chnlstStore.getChList.modModifySelectVisi === 'password'"
              placeholder="Set new password"
              v-model="chnlstStore.getChList.modModifyPwd"
            />
            <button class="Chn-mod-modify-submit" @click="modifyChannel()">Submit</button>
            <p class="Chn-mod-modify-msg" v-if="chnlstStore.getChList.notifModifyMsg">
              {{ chnlstStore.getChList.notifModifyMsg }}
            </p>
          </div>

          <button
            @click="
              {
                if (chnlstStore.getChList.modPendingRequestsArrowRotate === 'rotate(0deg)') {
                  chnlstStore.getChList.modPendingRequestsBoxDisplayToggle = '150px';
                  chnlstStore.getChList.modPendingRequestsArrowRotate = 'rotate(90deg)';

                  getAllPending();
                } else {
                  chnlstStore.getChList.modPendingRequestsBoxDisplayToggle = '0px';
                  chnlstStore.getChList.modPendingRequestsArrowRotate = 'rotate(0deg)';
                }
              }
            "
          >
            <svg fill="none" viewBox="0 0 16 16" width="12" height="12">
              <path
                fill="#000"
                fill-rule="evenodd"
                d="M5 2v12l6-6.001L5 2Z"
                clip-rule="evenodd"
              ></path>
            </svg>
            Pending Requests
          </button>
          <div>
            <div v-if="chnlstStore.getChList.getPendingsObj" :key="chnlstStore.getChList.getPendingsObjRef">
              <ChannelListItemPendings
                v-for="item in chnlstStore.getChList.getPendingsObj"
                v-bind:key="item.userId"
                :userId="item.userId"
                :userName="item.user.userName"
                :chId="item.chId"
                @to-approve="(choice) => approveOrReject(choice, item.userId)"
              />
              <p :key="chnlstStore.getChList.getPendingsObjRef" v-if="!chnlstStore.getChList.getPendingsObj.length">
                No pending member request
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.Channel-list {
  display: block;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.Channel-list::-webkit-scrollbar {
  display: none;
}

.Empty-channel-list {
  text-align: center;
  padding-top: 10px;
  color: #009900;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.Chl-box {
  display: none;
}
.Chl-box.ChlActive {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

.Chl-msgs-header {
  display: grid;
  grid-template-columns: 0.5fr 0.75fr 5fr max-content;
  grid-template-rows: 35px;
  width: 100%;
  height: 35px;
  padding: 0 5px;
  position: relative;
  background-color: #eeeefc;
  margin: 2px 0;
  border-radius: 5px;
}
.Chl-msgs-header > * {
  padding: 2px;
  overflow: hidden;
}
.Chl-msgs-header:hover {
  background-color: #f5f5dc;
}

.Chl-msgs-header > :nth-child(1) {
  font-size: 20px;
  color: #1c39bb;
  position: relative;
  top: 48%;
  transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  cursor: pointer;
}
.Chl-msgs-header > :nth-child(2) {
  width: 90%;
  height: auto;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  margin: 0 auto;
}
.Chl-msgs-header > :nth-child(3) {
  width: 100%;
  margin-top: -3px;
}
.Chl-msgs-header > :nth-child(3) > :nth-child(1) {
  display: block;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #1c39bb;
}
.Chl-msgs-header > :nth-child(3) > :nth-child(2) {
  display: block;
  font-size: 10px;
  margin-top: -6px;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-style: italic;
}
.Chl-msgs-header > :nth-child(4) {
  width: 20px;
  height: auto;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  margin: 0 auto;
  cursor: pointer;
}

.Chl-msgs-body {
  display: none;
}
.Chl-msgs-body.CmbActive {
  display: block;
  width: 100%;
  height: calc(100% - 35px);
  position: relative;
  bottom: 0;
}

.Channel-messages {
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
  height: 315px;
  overflow-y: scroll;
  border-radius: 10px;

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.Channel-messages::-webkit-scrollbar {
  display: none;
}
.New-channel-msg-input {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;

  display: grid;
  grid-template-columns: auto max-content;
  grid-template-rows: 35px;
  padding: 5px 2px 0 0;
}
.Channel-msg-box {
  width: 90%;
  height: 25px;
  margin: 0 auto;
  border: none;
  border-radius: 10px;
  padding: 5px 10px;
  box-shadow: 0 0 5px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Msg-box:focus,
.Msg-box:hover {
  box-shadow: 0 0 10px #73c2fb;
}
.Channel-msg-send {
  display: inline-block;
  position: relative;
  top: 30%;
  transform: translateY(-70%);
  -ms-transform: translateY(-70%);
  font-size: 30px;
  color: #1c39bb;
  cursor: pointer;
}
.I-am-muted {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #73c2fb;
  color: white;
  width: max-content;
  height: 35px;
  font-size: 14px;
  border-radius: 10px;
  border: none;
  padding-right: 15px;
  position: relative;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, -0);
  -ms-transform: translate(-50%, -0);
  box-shadow: 0 0 5px #73c2fb;
}
.I-am-muted > img {
  height: 20px;
  margin-right: 10px;
}

.Channel-moderate {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0 10px;
  overflow-y: scroll;
  border-radius: 10px;

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.Channel-moderate::-webkit-scrollbar {
  display: none;
}

.Channel-moderate > button:nth-child(1) {
  display: block;
  width: 100%;
  height: 30px;
  border: none;
  margin-top: 1px;
  background-color: #e9e9f9;
  padding: 5px 2px;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Channel-moderate > button:nth-child(1):hover {
  background-color: #eeeefc;
}
.Channel-moderate > button:nth-child(1) > svg {
  transform: v-bind('chnlstStore.getChList.modGetUserIdArrowRotate');
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Channel-moderate > div:nth-child(2) {
  display: block;
  width: 100%;
  height: v-bind('chnlstStore.getChList.modGetUserIdBoxDisplayToggle');
  overflow: hidden;
  border: none;
  padding: 0 5px;
  background-color: #f5f5dc;
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Chn-mod-get-id-input {
  width: 70%;
  height: 15px;
  font-size: 10px;
  margin: 10px 0 5px 5px;
  border: none;
  border-radius: 10px;
  padding-left: 10px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Chn-mod-get-id-input:focus,
.Chn-mod-get-id-input:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.Chn-mod-get-id-msg {
  margin: 0 5px 5px;
  font-size: 12px;
  font-weight: 500;
}

.Channel-moderate > button:nth-child(3) {
  display: block;
  width: 100%;
  height: 30px;
  border: none;
  margin-top: 1px;
  background-color: #e9e9f9;
  padding: 5px 2px;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Channel-moderate > button:nth-child(3):hover {
  background-color: #eeeefc;
}
.Channel-moderate > button:nth-child(3) > svg {
  transform: v-bind('chnlstStore.getChList.modMakeUserAdminArrowRotate');
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Channel-moderate > div:nth-child(4) {
  display: block;
  width: 100%;
  height: v-bind('chnlstStore.getChList.modMakeUserAdminBoxDisplayToggle');
  overflow: hidden;
  border: none;
  padding: 0 5px;
  background-color: #f5f5dc;
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Chn-mod-moder-member-id {
  display: block;
  width: 70%;
  height: 15px;
  font-size: 10px;
  margin: 10px 0 5px 5px;
  border: none;
  border-radius: 10px;
  padding-left: 10px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Chn-mod-moder-member-id:focus,
.Chn-mod-moder-member-id:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.Chn-mod-moder-select-action {
  display: block;
  width: 70%;
  height: 15px;
  font-size: 10px;
  margin: 10px 0 5px 5px;
  border: none;
  border-radius: 10px;
  padding-left: 10px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Chn-mod-moder-select-action:focus,
.Chn-mod-moder-select-action:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.Chn-mod-moder-mute-mins {
  display: block;
  width: 70%;
  height: 15px;
  font-size: 10px;
  margin: 10px 0 5px 5px;
  border: none;
  border-radius: 10px;
  padding-left: 10px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Chn-mod-moder-mute-mins:focus,
.Chn-mod-moder-mute-mins:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.Chn-mod-moder-submit {
  display: block;
  font-size: 10px;
  margin: 10px 0 5px 5px;
  border: none;
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 0 2px #73c2fb;
  -webkit-transition: 0.5s;
  transition: 0.5s;
}
.Chn-mod-moder-submit:focus,
.Chn-mod-moder-submit:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.Chn-mod-moder-msg {
  margin: 0 5px 5px;
  font-size: 12px;
  font-weight: 500;
}

.Channel-moderate > button:nth-child(5) {
  display: block;
  width: 100%;
  height: 30px;
  border: none;
  margin-top: 1px;
  background-color: #e9e9f9;
  padding: 5px 2px;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Channel-moderate > button:nth-child(5):hover {
  background-color: #eeeefc;
}
.Channel-moderate > button:nth-child(5) > svg {
  transform: v-bind('chnlstStore.getChList.modModifyChannelArrowRotate');
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Channel-moderate > div:nth-child(6) {
  display: block;
  width: 100%;
  height: v-bind('chnlstStore.getChList.modModifyChannelBoxDisplayToggle');
  overflow: hidden;
  border: none;
  padding: 0 5px;
  background-color: #f5f5dc;
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Chn-mod-modify-select-visi {
  display: block;
  width: 70%;
  height: 15px;
  font-size: 10px;
  margin: 10px 0 5px 5px;
  border: none;
  border-radius: 10px;
  padding-left: 10px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Chn-mod-modify-select-visi:focus,
.Chn-mod-modify-select-visi:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.Chn-mod-modify-password {
  display: block;
  width: 70%;
  height: 15px;
  font-size: 10px;
  margin: 10px 0 5px 5px;
  border: none;
  border-radius: 10px;
  padding-left: 10px;
  box-shadow: 0 0 2px #73c2fb;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Chn-mod-modify-password:focus,
.Chn-mod-modify-password:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.Chn-mod-modify-submit {
  display: block;
  font-size: 10px;
  margin: 10px 0 5px 5px;
  border: none;
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 0 2px #73c2fb;
  -webkit-transition: 0.5s;
  transition: 0.5s;
}
.Chn-mod-modify-submit:focus,
.Chn-mod-modify-submit:hover {
  box-shadow: 0 0 5px #73c2fb;
}
.Chn-mod-modify-msg {
  margin: 0 5px 5px;
  font-size: 12px;
  font-weight: 500;
}

.Channel-moderate > button:nth-child(7) {
  display: block;
  width: 100%;
  height: 30px;
  border: none;
  margin-top: 1px;
  background-color: #e9e9f9;
  padding: 5px 2px;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Channel-moderate > button:nth-child(7):hover {
  background-color: #eeeefc;
}
.Channel-moderate > button:nth-child(7) > svg {
  transform: v-bind('chnlstStore.getChList.modPendingRequestsArrowRotate');
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Channel-moderate > div:nth-child(8) {
  display: block;
  width: 100%;
  height: v-bind('chnlstStore.getChList.modPendingRequestsBoxDisplayToggle');
  overflow: hidden;
  border: none;
  background-color: #f5f5dc;
  transition: 0.5s;
  -webkit-transition: 0.5s;
}
.Channel-moderate > div:nth-child(8) > div:nth-child(1) {
  display: block;
  width: 100%;
  height: 100%;
  padding: 5px;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.Channel-moderate > div:nth-child(8) > div:nth-child(1)::-webkit-scrollbar {
  display: none;
}
</style>
