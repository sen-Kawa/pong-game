<script setup lang="ts">
  import { reactive, watch, onMounted } from 'vue'
  import type { ChatList, ChatListTmp, Chat_unionTb } from '@/components/khrov-chat/interface/khrov-chat'
  import ChatListItem from '@/components/khrov-chat/ChatListItem.vue'
  import ChatListItemMsg from '@/components/khrov-chat/ChatListItemMsg.vue'
  import { layer } from '@layui/layer-vue';
  import { useChatsStore } from '@/stores/chats'
  import { socket } from '@/sockets/sockets'
  import jwtInterceptor from '@/interceptor/jwtInterceptor';

  const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI;

  const chatsStore = useChatsStore();

  const cList: ChatList = reactive({
    chiChatConnsApiOk: 0,
    chiUnionUnderFocus: 0,
    chiMorphPartnerUserId: 0,
    chiMorphPartnerUName: '',
    chiMorphUnbAllowed: false,
    notifDiff: 0,
    loading: false,
  });

  const chatCache: any = reactive({});
  const offlineCache: ChatListTmp[] = [];
  let datas: Chat_unionTb[] = [];

  const deleteConversation = async (unionId: number) => {
    const tmp = {
      'unionId': unionId,
    }
    const response = await chatsStore.fetchForKhrov('/chats', 'DELETE', tmp);
    if (response && response.ok) {
      layer.msg('Conversation Deleted Successfully!', {time:5000});
    }
  }

  const blockUnblock = async (blocked: number, partner: string, flag: boolean) => {
    const tmp = {
      'blockedId': blocked,
    }
    let msg: string = `You have unblocked ${partner} successfully!` ;
    let route: string = '/chats';
    if (flag === true) {
      route += '/block/user';
      msg = msg.substr(0, 9) + msg.substr(11, msg.length);
    } else {
      route += '/block/user/unblock';
    }
    const response = await chatsStore.fetchForKhrov(route, 'PUT', tmp);
    if (response && response.ok) {
      layer.msg(msg, {time:5000});
    }
  }

  const setSeen = async (meReceiver: number, theySender: number) => {
    const tmp = {
      'meReceiver': meReceiver,
      'theySender': theySender
    }
    await chatsStore.fetchForKhrov('/chats/seen', 'PUT', tmp);
  }

  const submitChatMsg = async () => {
    if ( !cList.chiChatMsg ||
       ( cList.chiChatMsg && (cList.chiChatMsg.trimStart()).length == 0) ) {
      return ;
    }
    const tmp: ChatListTmp = {
        'outgoing': cList.chiChatMsg as string,
        'incoming': null,
        'time': new Date().toISOString(),
        'deliveryStatus': 'pending'
      };
    chatCache[cList.chiUnionUnderFocus] = [
      tmp, ...chatCache[cList.chiUnionUnderFocus]
    ];
    cList.chiChatMsg = '';
    tmp.unionId = cList.chiUnionUnderFocus;
    tmp.unionIdOther = cList.chiUnionIdOther;
    offlineCache.push(tmp);
    const response = await chatsStore.fetchForKhrov('/chats', 'PUT', offlineCache);
    if (response && response.ok) {
      offlineCache.length = 0;
    }
  }

  const calculateChatNotif = (datas : Chat_unionTb[]) : number => {
    let total: number = 0;
    for (let key in datas) {
      const oneUnion = datas[key];
      total += oneUnion.unreadCount;
    }
    return total ;
  }

  watch(() => cList.notifDiff, async (curr, expired) => {
    if (curr > expired) {
      let there_be_sounds = new Audio(chatsStore.getKhrovCelestial);
      there_be_sounds.play();
      chatsStore.manageAllNotifCounter(curr, 0);
    }
  })
  const getConversationPreviews = async () => {
    cList.loading = true;
    const response = await chatsStore.fetchForKhrov(`/chats/previews`, 'GET', {});
    if (response) {
      cList.loading = false;
      try {
        if (!response.ok) throw response;
        const jsonObj = await response.json();
        if (JSON.stringify(datas) != JSON.stringify(jsonObj)) {
          datas = jsonObj;
          cList.chiChatConnsApiOk+=1;
          cList.notifDiff = calculateChatNotif(datas);
        }

      } catch (error) {
         cList.chiChatConnsApiOk = cList.chiChatConnsApiOk ? 1 : 0;
      }
    }
    if (cList.chiChatConnsApiOk && cList.chiUnionUnderFocus){
      await getOneConversation();
    }
    cList.loading = false;
  }

  const getOneConversation = async () => {
    const response = await chatsStore.fetchForKhrov(`/chats?unionId=${cList.chiUnionUnderFocus}`, 'GET', {});
    if (response) {
      try {
        if (!response.ok) throw response;
        const jsonObj = await response.json();
        if (JSON.stringify(chatCache[cList.chiUnionUnderFocus]) != JSON.stringify(jsonObj.chat_historys)) {
          chatCache[cList.chiUnionUnderFocus] = jsonObj.chat_historys;
        }
      } catch {/* Do nothing */}
    }
  }

  onMounted(() => {
    getConversationPreviews();
    socket.on('new-chat-event', (id: number) => {
    // Tricky Bug: chatCache{key: {},...} key will be empty
    // when no conversation has been clicked from preview yet
    let found: boolean = false;
    for (let key in datas) {
      const union = datas[key];
      if (union.unionId === id) {
        found = true;
        break ;
      }
    }
    // const found: boolean = chatCache.hasOwnProperty(id)
    // const found = Object.getOwnPropertyDescriptor(chatCache, id)
    if (found || id === 0) {
      getConversationPreviews();
    }
  })
});

  const vtofctc = reactive({
    ChatsListIsActive: true,
    SingleConversationIsActive: false,
    MyProfileIsActive: false,
    TheirProfileIsActive: false,
  })
  const cactc = (param : string) => {
    vtofctc.ChatsListIsActive = param === 'Chats-list' ? true : false;
    vtofctc.SingleConversationIsActive = param === 'Single-conversation' ? true : false;
    vtofctc.MyProfileIsActive = param === 'My-profile' ? true : false;
    vtofctc.TheirProfileIsActive = param === 'Their-profile' ? true : false;
  }

  const styling = reactive({
    TopOfChatUlHeight: '0px',
    DeleteConvLiDisplay: 'block',
    ConfirmDeleteLiDisplay: 'none',
    DisplayBlockingQuestion: 'block',
    DisplayBlockingConfirm: 'none',
    ProfileUlHeight: '0px',
  });

</script>

<template>
  <div id="Chatlist-output-boxes">
    <div class="Chats-list Output-box" :class="{clActive: vtofctc.ChatsListIsActive}" >
      <div :key='cList.chiChatConnsApiOk' v-if='cList.chiChatConnsApiOk'>
        <ChatListItem v-for='(item) in datas'
          v-bind:key="item.client2Id"
          :unionId="item.unionId"
          :partnerId="item.client2Id"
          :partnerUName="item.client2.userName"
          :partnerDp="item.client2.profile_pics[0].avatar"
          :blockStatus="item.blockStatus"
          :allowedToUnblock="item.allowedToUnblock"
          :unreadCount="item.unreadCount"
          :time="item.updatedAt"
          :outgoingMsg="item.chat_historys[0].outgoing"
          :incomingMsg="item.chat_historys[0].incoming"
          :deliveryStatus="item.chat_historys[0].deliveryStatus"
          @click="{
            cList.chiChatMsg = '';
            cList.chiUnionUnderFocus = item.unionId;
            cList.chiUnionIdOther = item.unionIdOther;
            cList.chiMorphPartnerUserId = item.client2Id;
            cList.chiMorphPartnerDp = item.client2.profile_pics[0].avatar;
            cList.chiMorphPartnerUName = item.client2.userName;
            cList.chiMorphPartnerName = item.client2.name;
            cList.chiMorphPartnerEmail = item.client2.email;
            cList.chiMorphPartnerLastSeen = item.client2.updatedAt;
            cList.chiMorphBlockStatus = item.blockStatus;
            cList.chiMorphUnbAllowed = item.allowedToUnblock;
            setSeen(item.unionId, item.unionIdOther);
            getConversationPreviews();
            cactc('Single-conversation');
            chatsStore.manageAllNotifCounter(0, 0, 'chat');
            }"
          />
      </div>
      <div v-if='datas.length===0&&!cList.loading'>
        <p class="Empty-chat-list">No Chat Conversations to display!</p>
      </div>
      <div v-if='datas.length===0&&cList.loading' class="Awaiting-chat-list"></div>
    </div>

    <div class="Single-conversation Output-box" :class="{clActive: vtofctc.SingleConversationIsActive}"
      @click="setSeen(cList.chiUnionUnderFocus, cList.chiUnionIdOther as number)">
      <div v-if='cList.chiUnionUnderFocus'>
        <div class="Top-of-chat">
          <div class="Back-button-and-dp">
            <span class="Union-back-btn" @click="{
              cactc('Chats-list');
              styling.TopOfChatUlHeight='0px';
              }">&#11164;
            </span>
            <img class="Union-view-dp" :src="cList.chiMorphPartnerDp" alt="Avatar">
            <span class="Union-display-name">{{cList.chiMorphPartnerUName}}</span>
            <span class="Union-hamburger-icon" @click="{
                if (styling.TopOfChatUlHeight==='120px'){
                  styling.TopOfChatUlHeight='0px';
                } else {
                  styling.TopOfChatUlHeight='120px';
                }

                styling.DeleteConvLiDisplay='block';
                styling.ConfirmDeleteLiDisplay='none';
              }">:::
            </span>
          </div>
          <ul class="Top-of-chat-ul">
            <li class="Top-of-chat-li" v-if='cList.chiMorphBlockStatus === false' @click="{

                styling.TopOfChatUlHeight='0px';

                cactc('Their-profile');
              }
              ">{{cList.chiMorphPartnerUName}}'s Profile
            </li>
            <li class="Top-of-chat-li Delete-conv-li" @click="{
              styling.DeleteConvLiDisplay='none';
              styling.ConfirmDeleteLiDisplay='block';
              }">Delete Conversation
            </li>
            <li class="Top-of-chat-li Confirm-delete-li">
              <button class="Confirm-delete-li-yes" @click="{

                  deleteConversation(cList.chiUnionUnderFocus);

                  styling.TopOfChatUlHeight='0px';

                  cactc('Chats-list');
                }">Confirm
              </button>
              <button class="Confirm-delete-li-no" @click="{

                  styling.DeleteConvLiDisplay='block';
                  styling.ConfirmDeleteLiDisplay='none';
                }">Back
              </button>
            </li>
          </ul>
        </div>

        <div id="bodyOfChats" class="bodyOfChat" :key='chatCache[cList.chiUnionUnderFocus]' v-if='chatCache[cList.chiUnionUnderFocus]'>
          <ChatListItemMsg v-for='(item) in chatCache[cList.chiUnionUnderFocus]' v-bind:key="item"
            :theirName="cList.chiMorphPartnerName ?? ''"
            :incoming="item.incoming"
            :outgoing="item.outgoing"
            :time="item.time"
            :status="item.deliveryStatus"
            @my-decision="(decision) => {
              cactc('Chats-list');
              cList.chiChatMsg=decision;
              submitChatMsg();
              if (decision==='äaäcäcäeäpätä') {
                $router.push({ path: '/game' });
              }
            }"
          />
        </div>

        <div class="bottomOfChat">
          <div class="Union-send-msg" :key="cList.chiMorphBlockStatus as unknown as number" v-if='cList.chiMorphBlockStatus === false'>
            <input class="Msg-box" v-model="cList.chiChatMsg" @keyup.enter="submitChatMsg" />
            <span class="Msg-send-btn" @click="submitChatMsg">&#11166;</span>
          </div>
          <button class="I-blocked-them" v-if="cList.chiMorphUnbAllowed === true">
            <img src="/khrov-chat-media/unblock.png" alt="Unblock">
            <span @click="{
                blockUnblock(cList.chiMorphPartnerUserId, cList.chiMorphPartnerUName, false);

                styling.TopOfChatUlHeight='0px';

                cactc('Chats-list');
              }">Unblock {{cList.chiMorphPartnerUName}}</span>
          </button>
          <button class="They-blocked-me" v-if='cList.chiMorphBlockStatus === true && cList.chiMorphUnbAllowed === false'>
            <img src="/khrov-chat-media/blocked.png" alt="Blocked">
            <span>{{cList.chiMorphPartnerUName}} Blocked You</span>
          </button>

        </div>
      </div>
    </div>

    <div class="Their-profile Output-box" :class="{clActive: vtofctc.TheirProfileIsActive}">
      <div v-if='cList.chiUnionUnderFocus'>
        <div class="Their-profile-output">
          <div>
            <span class="Profile-back-btn" @click="{

                styling.ProfileUlHeight='0px';

                cactc('Single-conversation');
              }">&#11164;
            </span>
            <span class="Profile-name">
              {{cList.chiMorphPartnerUName}}
            </span>
            <span class="Profile-hamburger-icon" @click="{
              if (styling.ProfileUlHeight==='40px'){
                styling.ProfileUlHeight='0px';
              } else {
                styling.ProfileUlHeight='40px';
              }

              }">:::
            </span>
            <ul class="Profile-item-ul">
              <li class="Profile-item-li" @click="async () => {
                  try {
                    const response = await jwtInterceptor.post(baseUrl + '/match/invite', {playerId: cList.chiMorphPartnerUserId}, { withCredentials: true })
                    if (response.status !== 201) throw response;

                    const matchId: number = response.data;
                    cList.chiChatMsg='äiänäväiätäeä' + matchId;
                    await submitChatMsg();
                    styling.ProfileUlHeight='0px';
                    layer.msg('Invite Sent!');
                    await $router.push({ path: '/game' });
                    $router.go(0);
                  } catch (e) {
                    console.error(e)
                    layer.msg('Invite Failed!');
                  }
                }">
                Game Invite {{cList.chiMorphPartnerUName}}
              </li>
            </ul>
          </div>
          <img class="Profile-view-dp" :src="cList.chiMorphPartnerDp" alt="Avatar">
          <span class="Their-profile-details">
            <img class="Profile-icon Email" alt="Email Icon" src="/khrov-chat-media/email.png"/><span>{{cList.chiMorphPartnerEmail}}</span>
          </span>
          <span class="Their-profile-details">
            <img class="Profile-icon Signature" alt="Signature Icon" src="/khrov-chat-media/signature.png"/><span>{{cList.chiMorphPartnerName}}</span>
          </span>
          <span class="Their-profile-details">
            <img class="Profile-icon LastSeen" alt="Joined Icon" src="/khrov-chat-media/lastSeen.png"/><span>{{cList.chiMorphPartnerLastSeen}}</span>
          </span>
          <span class="Their-profile-details Block" @click="{
              styling.DisplayBlockingQuestion='none';
              styling.DisplayBlockingConfirm='block';
            }">
            <img class="Profile-icon Block" alt="Email Icon" src="/khrov-chat-media/block.png"/><span v-if="!cList.chiMorphBlockStatus">Block Messages From </span><span v-if="cList.chiMorphBlockStatus">Unblock Messages From </span><span>&nbsp;{{cList.chiMorphPartnerUName}}</span>
          </span>
          <span class="Their-profile-details Block-confirm">
            <span class="Confirm-blocking-yes" @click="{
            styling.DisplayBlockingConfirm='none';
            styling.DisplayBlockingQuestion='block';

            blockUnblock(cList.chiMorphPartnerUserId, cList.chiMorphPartnerUName, true);

            styling.TopOfChatUlHeight='0px';

            cactc('Chats-list');
            }">Confirm</span>
            <span class="Confirm-blocking-no" @click="{
            styling.DisplayBlockingConfirm='none';
            styling.DisplayBlockingQuestion='block';
            }">Cancel</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
#Chatlist-output-boxes {
  position: relative;
  height: 100%;
  width: 100%;
}

.Output-box {
  display: none;
  height: 100%;
  width: 100%;
}
.Output-box.clActive {
  display: block;
}

.Chats-list {
  position: relative;
  width: 100%;
  height: 100%;
}
.Awaiting-chat-list {
  width: 100%;
  height: 100%;
  background-image: url(/khrov-chat-media/awaitingApi.gif);
  background-repeat: no-repeat;
  background-size: 30%;
  background-position: center;
}
.Empty-chat-list {
  text-align: center;
  padding-top: 10px;
  color: #009900;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.Single-conversation {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

}
.Top-of-chat {
  display: block;
  position: relative;
  top: 0;
  left: 0;
  width: 97%;
  height: 40px;
  background-color: #d7e1ec;
  border-radius: 10px;
  margin: 5px;
  box-shadow: 0 0 5px #73C2FB;
}
.bodyOfChat {
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

.bodyOfChat::-webkit-scrollbar {
  display: none;
}
.bottomOfChat {
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
}

.Back-button-and-dp {
  display: grid;
  grid-template-columns: 10% 20% 60% 10%;
  grid-template-rows: 36px;

  width: 100%;
  height: 36px;
  padding: 3px 4px 0;
  position: relative;

}
.Union-back-btn {
  display: block;
  height: 32px;
  position: relative;
  top: 25%;
  left: 0;
  transform: translate(-0, -50%);
  -ms-transform: translate(-0, -50%);
  font-size: 30px;
  color: #1C39BB;
  cursor: pointer;
}
.Union-view-dp {
  height: 36px;
  aspect-ratio: 1/1;
  margin: 0 2px 5px 5px;
  border-radius: 50%;
}
.Union-display-name {
  display: inline-block;
  width: 100%;
  height: auto;
  font-size: 16px;
  color: #1C39BB;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  position: relative;
  left: 10%;
  top: 60%;
  transform: translate(-0, -50%);
  -ms-transform: translate(-0, -50%);
}
.Union-hamburger-icon {
  position: relative;
  left: 25%;
  top: 45%;
  transform: translate(-0, -50%);
  -ms-transform: translate(-0, -50%);
  font-size: 20px;
  font-weight: 600;
  color: #1C39BB;
  cursor: pointer;
}

.Top-of-chat-ul {
  position: absolute;
  top: 40px;
  right: 5px;
  z-index: 2;
  border-radius: 5px;
  height: v-bind('styling.TopOfChatUlHeight');
  overflow: hidden;
  list-style: none;
  margin: 0;
  padding: 0 2px;
  -webkit-transition: height 0.5s;
  transition: height 0.5s;

}
.Top-of-chat-li {
  display: block;
  position: relative;
  height: 35px;
  width: 160px;
  overflow: hidden;
  background-color: #F5F5DC;
  padding: 5px 20px 5px 10px;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
  box-shadow: 0 0 5px #1C39BB;
  white-space: nowrap;
  text-transform: capitalize;
  cursor: pointer;
}
.Top-of-chat-li:hover {
  background-color: #eded84;
}
.Top-of-chat-li:nth-child(n+2) {
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}
.Top-of-chat-li.Delete-conv-li {
  display: v-bind('styling.DeleteConvLiDisplay');
}
.Top-of-chat-li.Confirm-delete-li {
  display: v-bind('styling.ConfirmDeleteLiDisplay');
  padding: 0;
  background-color: #d7e1ec;
}
button.Confirm-delete-li-yes, button.Confirm-delete-li-no {
  display: inline-block;
  position: relative;
  top: 0;
  transform: translateY(-20%);
  -ms-transform: translateY(-20%);
  border: none;
  padding: 5px;
  color: white;
  width: 47%;
  margin-left: 2%;
  font-size: 13px;
  cursor: pointer;
}
button.Confirm-delete-li-yes {
  background-color: #73C2FB;
}
button.Confirm-delete-li-no {
  background-color: #1C39BB;
}

.Union-send-msg {
  display: grid;
  grid-template-columns: auto max-content;
  grid-template-rows: 35px;
  padding: 5px 2px 0 0;
}
.Msg-box {
  width: 90%;
  height: 25px;
  margin: 0 auto;
  border: none;
  border-radius: 10px;
  padding: 5px 10px;
  box-shadow: 0 0 5px #73C2FB;
  outline: none;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.Msg-box:focus, .Msg-box:hover {
  box-shadow: 0 0 10px #73C2FB;
}
.Msg-send-btn {
  display: inline-block;
  position: relative;
  top: -17px;
  font-size: 35px;
  color: #1C39BB;
  cursor: pointer;
}

.I-blocked-them {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #73C2FB;
  color: white;
  width: max-content;
  height: 35px;
  font-size: 16px;
  border-radius: 10px;
  border: none;
  padding-right: 15px;
  position: relative;
  left: 50%;
  bottom: 10%;
  transform: translate(-50%, -10%);
  -ms-transform: translate(-50%, -10%);
  box-shadow: 0 0 5px #73C2FB;
  cursor: pointer;
}
.I-blocked-them > img, .They-blocked-me > img {
  height: 20px;
  margin-right: 10px;
}
.They-blocked-me {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #73C2FB;
  color: white;
  width: max-content;
  height: 35px;
  font-size: 16px;
  border-radius: 10px;
  border: none;
  padding-right: 15px;
  position: relative;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, -0);
  -ms-transform: translate(-50%, -0);
  box-shadow: 0 0 5px #73C2FB;
}

.Their-profile-output {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 40px 150px 50px 50px 50px 50px;
  width: 100%;
  height: 100%;
  padding: 3px 8px;
  position: relative;
}
.Their-profile-output > * {
  display: block;

  margin: 10px auto;
  padding: 10px;
}
.Their-profile-output > *:first-child {
  width: 100%;
  height: 40px;
  margin: 5px 5px 5px 0;
  position: relative;
  background-color: #d7e1ec;
  border-radius: 10px;
  box-shadow: 0 0 5px #73C2FB;
}
.Their-profile-output > *:nth-child(2) {

  background-color: #d7e1ec;
  box-shadow: 0 0 5px #73C2FB;

}

.Profile-back-btn, .Profile-name, .Profile-hamburger-icon {
  display: inline-block;
  position: relative;
  padding: 0;
  color: #1C39BB;
}
.Profile-back-btn {
  cursor: pointer;
  font-size: 25px;
  top: 45%;
  transform: translateY(-50%);
  -ms-transform: translateY(-50%);
}
.Profile-name {
  margin-left: 40px;
  text-transform: uppercase;
  font-size: 16px;
  top: 30%;
  transform: translateY(-75%);
  -ms-transform: translateY(-75%);
}
.Profile-hamburger-icon {
  position: absolute;
  right: 10px;
  top: 45%;
  transform: translate(-0, -50%);
  -ms-transform: translate(-0, 50%);
  font-size: 20px;
  font-weight: 600;
  color: #1C39BB;
  cursor: pointer;
}
.Profile-item-ul {
  position: absolute;
  right: 10px;
  top: 50px;
  transform: translateY(-10px);
  -ms-transform: translateY(-10px);
  z-index: 2;
  border-radius: 5px;
  height: v-bind('styling.ProfileUlHeight');
  overflow: hidden;
  list-style: none;
  margin: 0;
  padding: 0 2px;
  -webkit-transition: height 0.5s;
  transition: height 0.5s;
}
.Profile-item-li {
  display: block;
  position: relative;
  height: 35px;
  width: 160px;
  overflow: hidden;
  background-color: #F5F5DC;
  padding: 5px 20px 5px 10px;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
  box-shadow: 0 0 5px #1C39BB;
  white-space: nowrap;
  text-transform: capitalize;
  cursor: pointer;
}
.Profile-item-li:hover {
  background-color: #eded84;
}
.Profile-item-li:last-child {
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}
.Profile-view-dp {
  display: block;
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
}
.Their-profile-output > *:nth-child(n+3) {
  overflow: hidden;
  margin: 0;
  border-radius: 10px;
  color: #73C2FB;
  font-size: 15px;
  -webkit-transition: 1s;
  transition: 1s;
}
.Their-profile-output > *:nth-child(n+3):hover {
  box-shadow: inset 0 -3px 0 0 #73C2FB;
}
.Their-profile-details {
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  height: 100%;
}
.Profile-icon {
  display: inline-block;
  width: 30px;
  height: 20px;
  padding: 0 5px;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  -ms-transform: translateY(-50%);
}
.Their-profile-details.Block {
  display: v-bind('styling.DisplayBlockingQuestion');
  cursor: pointer;
}
.Their-profile-details.Block-confirm {
  display: v-bind('styling.DisplayBlockingConfirm');
}
.Confirm-blocking-yes, .Confirm-blocking-no {
  display: inline-block;
  position: relative;
  width: 50%;
  height: 100%;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  border: none;
  padding-bottom: 10px;
  color: white;
  cursor: pointer;
}
.Confirm-blocking-yes {
  background-color: #73C2FB;
  border-bottom-left-radius: 10px;
}
.Confirm-blocking-no {
  background-color: #1C39BB;
  border-bottom-right-radius: 10px;
}

</style>
