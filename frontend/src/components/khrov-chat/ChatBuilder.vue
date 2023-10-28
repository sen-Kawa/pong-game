<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ChatIcon from '@/components/khrov-chat/ChatIcon.vue'
import ChatWindow from '@/components/khrov-chat/ChatWindow.vue'
import { useChatsStore } from '@/stores/chats'

const chatsStore = useChatsStore();
const authStore = useAuthStore();
const startChat = ref<number>(0);

onMounted(() => {
  document.addEventListener('click', closeChatWindow, false)
})

onUnmounted(() => {
  document.removeEventListener('click', closeChatWindow, false)
})

// watch(() => authStore.isLoggedIn, (newStatus) => { if (newStatus===true) ApiHealth(); })

// const ApiHealth = async () => {
//   await chatsStore.fetchForKhrov('/chats/app/plugin/chat/health', 'PUT', {});
// }

const closeChatWindow = (e: Event) => {
  const chatWindow = document.getElementById('ChatWindow-container')
  const chatIcon = document.getElementById('ChatIcon-container')

  if (chatWindow && chatIcon) {
    if (!chatWindow.contains(e.target as Node) && !chatIcon.contains(e.target as Node)) {
      chatWindow.style['display'] = 'none'
    }
  }
}

const openChatWindow = () => {
  const chatWindow = document.getElementById('ChatWindow-container')
  if (chatWindow) {
    chatWindow.style['display'] = 'block'
  }
}

</script>

<template>
  <div v-if="authStore.isLoggedIn">
    <div id="ChatIcon-container" @click="{
                                            if (startChat) {
                                              openChatWindow();
                                              chatsStore.manageAllNotifCounter(0, 0, 'icon');
                                            }
                                            startChat=1;
                                          }"
    >
      <ChatIcon />
    </div>
    <div id="ChatWindow-container" v-if="startChat">
      <ChatWindow />
    </div>
  </div>
</template>

<style scoped>
#ChatIcon-container {
  display: block;
  position: fixed;
  bottom: 85px;
  right: 15px;
  height: 60px;
  z-index: 1;
  aspect-ratio: 1/1;
}

#ChatWindow-container {
  display: none;
  position: fixed;
  bottom: 5px;
  right: 5px;
  width: 300px;
  height: 500px;
  z-index: 2;
  text-align: start;
}
</style>
