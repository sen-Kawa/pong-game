<script setup lang="ts">
import { reactive } from 'vue'
import type { ChatInviteItem } from '@/components/khrov-chat/interface/khrov-chat'
import { layer } from '@layui/layer-vue'
import { useChatsStore } from '@/stores/chats'

const props = defineProps<{
  theirId: number
  displayName: string
  profileDp: string
}>()

const chatsStore = useChatsStore();

const ciItem: ChatInviteItem = reactive({
  ciiBlockPanelHeight: '0px',
  ciiMsgPanelHeight: '0px',
  ciiMsgInput: ''
})

const sendNewMsg = async () => {
  if (ciItem.ciiMsgInput.length < 1) {
    return
  }
  const tmp = {
    receiverId: props.theirId,
    msg: ciItem.ciiMsgInput
  }
  const response = await chatsStore.fetchForKhrov('/chats', 'POST', tmp);
    if (response) {
      try {
        if (!response.ok) {
          layer.msg('Message could not be sent', { time: 5000 })
          throw response
        }
        ciItem.ciiMsgInput = ''
        ciItem.ciiMsgPanelHeight = '0px'
        layer.msg('Message sent Successfully', { time: 5000 })
      } catch {/* Do nothing */}
    }
}

const blockUser = async (blocked: number, partner: string) => {
  const tmp = {
    blockedId: blocked
  }
  const response = await chatsStore.fetchForKhrov('/chats/block/user', 'PUT', tmp);
  if (response) {
    if (response.ok) {
      layer.msg(`You have blocked ${partner} successfully!`, { time: 5000 })
    } else {
      layer.msg(`Could not block ${partner}!`, { time: 5000 })
    }
  }
}
</script>
<template>
  <div id="Chat-invite-item">
    <div class="User-preview">
      <div>
        <img :src="profileDp" alt="Avatar" />
      </div>
      <span>{{ displayName }}</span>
      <div>
        <img
          src="/khrov-chat-media/chat.png"
          alt="Message"
          @click="
            {
              ciItem.ciiBlockPanelHeight = '0px';

              if (ciItem.ciiMsgPanelHeight === '0px') {
                ciItem.ciiMsgPanelHeight = '25px';
              } else {
                ciItem.ciiMsgPanelHeight = '0px';
              }
            }
          "
        />
      </div>
      <div>
        <img
          src="/khrov-chat-media/block.png"
          alt="Block"
          @click="
            {
              ciItem.ciiMsgPanelHeight = '0px';

              if (ciItem.ciiBlockPanelHeight === '0px') {
                ciItem.ciiBlockPanelHeight = '25px';
              } else {
                ciItem.ciiBlockPanelHeight = '0px';
              }
            }
          "
        />
      </div>
    </div>
    <div class="Messaging-box-div">
      <input class="Messaging-box" v-model="ciItem.ciiMsgInput" @keyup.enter="sendNewMsg" />
    </div>
    <div class="Blocking-box-div">
      <button
        @click="
          {
            ciItem.ciiBlockPanelHeight = '0px';
            blockUser(theirId, displayName); //
          }
        "
      >
        Yes
      </button>
      <button @click="ciItem.ciiBlockPanelHeight = '0px'">No</button>
    </div>
  </div>
</template>
<style scoped>
#Chat-invite-item {
  position: relative;
}
.User-preview {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  grid-template-rows: 50px;
  width: 100%;
  height: 50px;
  padding: 5px;
  position: relative;
  background-color: rgb(245, 245, 245);
  -webkit-transition: 0.5s;
  transition: 0.5s;
}
.User-preview > * {
  width: 100%;
  height: 100%;
  padding: 5px;
}
.User-preview:hover {
  background-color: #f5f5dc;
}
.User-preview > :nth-child(1) > img {
  position: relative;
  top: 41%;
  transform: translateY(-50%);
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
}
.User-preview > :nth-child(2) {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  width: 100%;
  font-size: 16px;
  color: #1c39bb;
  margin: 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
}
.User-preview > :nth-child(3) > img,
.User-preview > :nth-child(4) > img {
  position: relative;
  top: 40%;
  transform: translateY(-50%);
  height: 30px;
  aspect-ratio: 1/1;
  margin: 0 auto;
  cursor: pointer;
}

.Messaging-box-div {
  display: block;
  width: 110px;
  height: v-bind('ciItem.ciiMsgPanelHeight');
  overflow: hidden;
  position: absolute;
  bottom: -5px;
  right: 60px;

  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Messaging-box {
  display: block;
  width: 100px;
  height: 15px;
  border: none;
  border-radius: 10px;
  padding: 5px 10px;
  box-shadow: 0 0 5px #73c2fb;
  outline: none;
  margin: 5px;
  font-size: 10px;
}

.Blocking-box-div {
  display: block;
  width: 60px;
  height: v-bind('ciItem.ciiBlockPanelHeight');
  overflow: hidden;
  position: absolute;
  bottom: -1px;
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
