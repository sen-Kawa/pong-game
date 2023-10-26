import { defineStore } from 'pinia'
import { 
  computed, 
  // ref, 
  reactive 
} from 'vue'
// import { onMounted, watch } from 'vue'
import type { 
  // ChnListOfflineCache, 
  ChList,
  // ChnListChannConn,
  // ChnListPendingList
} from '@/components/khrov-chat/interface/khrov-chat'

export const useChannelListStore = defineStore('ChannelList', () => {
  const chList: ChList = reactive({
    channConn: [],
    chlItemActive: true,
    chlMsgsActive: false,
    chlModActive: false,
    chlVisibilityOfFocus: '',
    chlIdOfFocus: 0,
    chlNameOfFocus: '',
    chlDescOfFocus: '',
    chlRoleOfFocus: '',
    linkStatusOfFocus: '',
    mutedUntilOfFocus: '',
    chlMsgOrModerate: true,
    chlMsgInput: '',
    modGetUserIdArrowRotate: 'rotate(0deg)',
    modGetUserIdBoxDisplayToggle: '0px',
    modMakeUserAdminArrowRotate: 'rotate(0deg)',
    modMakeUserAdminBoxDisplayToggle: '0px',
    modModifyChannelArrowRotate: 'rotate(0deg)',
    modModifyChannelBoxDisplayToggle: '0px',
    modPendingRequestsArrowRotate: 'rotate(0deg)',
    modPendingRequestsBoxDisplayToggle: '0px',
    modGetUserIdInput: '',
    notifMsg: '',
    modModerMemberId: '',
    modModerSelectAction: '',
    modModerMuteMins: '',
    notifModerMsg: '',
    modModifySelectVisi: '',
    modModifyPwd: '',
    notifModifyMsg: '',
    getPendingsObj: [],
    getPendingsObjRef: 0,
    notifDiff: 0
  })

  const getChList = computed(() => chList);


  return { 
    getChList, 

  }
})
