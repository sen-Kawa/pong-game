<script setup lang="ts">
import { reactive } from 'vue'
import { onMounted } from 'vue'
import ChatBlockedItem from '@/components/khrov-chat/ChatBlockedItem.vue'
import type { ChatBlocked, Chat_unionTb } from '@/components/khrov-chat/interface/khrov-chat'
import { useChatsStore } from '@/stores/chats'
import { socket } from '@/sockets/sockets'

const chatsStore = useChatsStore();
const cBlkd: ChatBlocked = reactive({
  cbkKeyBuild: 0
})
let output: Chat_unionTb[]

const searchBlocked = async () => {
  const response = await chatsStore.fetchForKhrov(`/chats/blocked/search`, 'GET', {});
  if (response) {
    try {
      if (!response.ok) throw response;
      const jsonObj = await response.json();
      if (JSON.stringify(output) != JSON.stringify(jsonObj)) {
        output = jsonObj
        cBlkd.cbkKeyBuild += 1
      }
    } catch {/* Do nothing */}
  }
}

onMounted(() => {
  searchBlocked();
  socket.on('new-chat-event', (/*id: number*/) => {
    // Todo make this blocked more responsive 
    // const found: boolean = chatCache.hasOwnProperty(id)
    // if (found || id === 0) {
      searchBlocked();
    // }
  })
})
</script>
<template>
  <div v-if="cBlkd.cbkKeyBuild" :key="cBlkd.cbkKeyBuild">
    <ChatBlockedItem
      v-for="item in output"
      v-bind:key="item.client2Id"
      :theirId="item.client2Id"
      :displayName="item.client2.userName"
      :profileDp="item.client2.profile_pics[0].avatar"
    />
  </div>
</template>
<style scoped></style>
