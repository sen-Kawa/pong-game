<script setup lang="ts">
import { reactive } from 'vue'
import type { ChatBlockedItem } from '@/components/khrov-chat/interface/khrov-chat'
import { layer } from '@layui/layer-vue'
import { useChatsStore } from '@/stores/chats'

defineProps<{
  theirId: number
  displayName: string
  profileDp: string
}>()

const chatsStore = useChatsStore();
const cbItem: ChatBlockedItem = reactive({
  cbiBlockPanelHeight: '0px'
})

const unblockUser = async (blocked: number, partner: string) => {
  const tmp = {
    blockedId: blocked
  }
  const response = await chatsStore.fetchForKhrov('/chats/block/user/unblock', 'PUT', tmp);
  if (response && response.ok) {
    layer.msg(`You have unblocked ${partner} successfully!`, { time: 5000 })
  } else {
    layer.msg(`Could not unblock ${partner}!`, { time: 5000 })
  }
}
</script>
<template>
  <div id="Chat-blocked-item">
    <div class="Blocked-user-preview">
      <div>
        <img :src="profileDp" alt="Avatar" />
      </div>
      <span>{{ displayName }}</span>
      <div>
        <img
          src="/khrov-chat-media/blocked.png"
          alt="Unblock"
          @click="
            {
              // Now toggle
              if (cbItem.cbiBlockPanelHeight === '0px') {
                cbItem.cbiBlockPanelHeight = '25px';
              } else {
                cbItem.cbiBlockPanelHeight = '0px';
              }
            }
          "
        />
      </div>
    </div>
    <div class="Blocking-box-div">
      <button
        @click="
          {
            cbItem.cbiBlockPanelHeight = '0px';
            unblockUser(theirId, displayName);
          }
        "
      >
        Yes
      </button>
      <button @click="cbItem.cbiBlockPanelHeight = '0px'">No</button>
    </div>
  </div>
</template>
<style scoped>
#Chat-blocked-item {
  position: relative;
}

.Blocked-user-preview {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: 50px;
  width: 100%;
  height: 50px;
  padding: 5px;
  position: relative;
}
.Blocked-user-preview > * {
  width: 100%;
  height: 100%;
  padding: 5px;
}
.Blocked-user-preview:hover {
  background-color: rgb(245, 245, 245);
}
.Blocked-user-preview > :nth-child(1) > img {
  position: relative;
  top: 41%;
  transform: translateY(-50%);
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
}
.Blocked-user-preview > :nth-child(2) {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  width: 100%;
  font-size: 16px;
  color: #1c39bb;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
}
.Blocked-user-preview > :nth-child(3) > img {
  position: relative;
  top: 40%;
  transform: translateY(-50%);
  height: 30px;
  aspect-ratio: 1/1;
  margin: 0 auto;
  cursor: pointer;
}

.Blocking-box-div {
  display: block;
  width: 60px;
  height: v-bind('cbItem.cbiBlockPanelHeight');
  overflow: hidden;
  position: absolute;
  bottom: -2px;
  right: 0;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Blocking-box-div * {
  display: inline-block;
  white-space: nowrap;
  font-size: 8px;
  margin: auto 0;
  padding: 3px 5px;
  border: none;
  color: white;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Blocking-box-div > :nth-child(1) {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  margin-left: 5px;
  background-color: #73c2fb;
}
.Blocking-box-div > :nth-child(2) {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  background-color: #1c39bb;
}
.Blocking-box-div > :nth-child(1):hover {
  box-shadow: 0 0 2px #73c2fb;
}
.Blocking-box-div > :nth-child(2):hover {
  box-shadow: 0 0 2px #1c39bb;
}
</style>
