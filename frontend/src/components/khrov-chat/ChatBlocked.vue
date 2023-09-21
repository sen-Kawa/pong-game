<script setup lang="ts">
import { reactive } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import ChatBlockedItem from '@/components/khrov-chat/ChatBlockedItem.vue'
import type { ChatBlocked, Chat_unionTb } from '@/components/khrov-chat/interface/khrov-chat'
import { useChatsStore } from '@/stores/chatsAll'

const props = defineProps<{
  sTemp: number
}>()

const chatsStore = useChatsStore();
const $: number = props.sTemp as unknown as number
const cBlkd: ChatBlocked = reactive({
  cbkKeyBuild: 0
})
let output: Chat_unionTb[]

const searchBlocked = async () => {
  const response = await chatsStore.fetchForKhrov(`/chats/blocked/${$}`, 'GET', {});
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

let intervalId: ReturnType<typeof setInterval>
onMounted(() => {
  searchBlocked()
  intervalId = setInterval(searchBlocked, 5000)
})
onUnmounted(() => {
  clearInterval(intervalId)
})
</script>
<template>
  <div v-if="cBlkd.cbkKeyBuild" :key="cBlkd.cbkKeyBuild">
    <ChatBlockedItem
      v-for="item in output"
      :myId="$"
      :theirId="item.client2Id"
      :displayName="item.client2.userName"
      :profileDp="item.client2.profile_pics[0].avatar"
    />
  </div>
</template>
<style scoped></style>
