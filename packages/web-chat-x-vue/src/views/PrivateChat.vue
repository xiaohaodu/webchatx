<template>
  <el-container class="h-full flex">
    <el-header class="bg-gray-100 flex items-center justify-between">
      <el-tooltip :content="`${friend?.name}@${friend?.id}`" placement="top">
        <h2 class="text-lg font-semibold break-all line-clamp-1 w-full" >{{ `${friend?.name}@${friend?.id}` }}</h2>
     </el-tooltip>
    </el-header>
    <el-main ref="refMain" class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <div v-for="(message, index) in messages?.messages"
        :key="index"
        :class="[
          'p-2 flex flex-col flex-shrink-0 justify-start',
          message.postUserId===currentUser.id && 'justify-end',
        ]">
        <div v-if="message.postUserId===currentUser.id" class="flex items-start flex-row-reverse">
          <img
            :src="currentUser.avatar"
            alt="User Avatar"
            class="w-8 h-8 rounded-full"
          />
          <p
            class="text-right text-gray-600"
          >
            {{ currentUser.name }}
            <div
            class="flex flex-col self-end text-right"
          >
            <span class="text-gray-600" v-if="message.text">
              {{ message.text }}
            </span>
            <span v-else @click="downloadFile(message.file!)" class="cursor-pointer text-green-500 flex flex-col justify-center items-center">
              <img :src="fileIcon" :alt="message.file?.name" class="h-12 w-12">
              <span class="text-green-500">{{ message.file?.name }}</span>
            </span>
            <span class="text-gray-400 text-xs">{{
              formatTime(message.time)
            }}</span>
          </div>
          </p>
        </div>
        <div v-else class="flex flex-row items-start">
          <img
            :src="friend.avatar"
            alt="User Avatar"
            class="w-8 h-8 rounded-full"
          />
          <p
            class="text-left text-gray-600"
          >
            {{message.postUserId===currentUser.id? currentUser.name:friend.name }}
            <div
            :class="[
              'flex flex-col self-end',
              message.postUserId===currentUser.id ? 'text-right' : 'text-left',
            ]"
          >
          <span class="text-gray-600" v-if="message.text">
              {{ message.text }}
            </span>
            <span v-else @click="downloadFile(message.file!)" class="cursor-pointer text-green-500 flex flex-col justify-center items-center">
              <img :src="fileIcon" :alt="message.file?.name" class="h-12 w-12">
              <span class="text-green-500">{{ message.file?.name }}</span>
            </span>
            <span class="text-gray-400 text-xs">{{
              formatTime(message.time)
            }}</span>
          </div>
          </p>
        </div>
      </div>
    </el-main>
    <el-footer class="flex flex-col flex-shrink-0" height="auto">
      <el-row class="flex flex-row justify-between">
        <div class="cursor-pointer flex flex-row">
          <div class="relative bottom-10" v-show="emojiShow">
            <EmojiComponent @emoji-click="emojiClick" class="absolute bottom-0 left-0" ></EmojiComponent>
          </div>
          <span class="m-1 icon-[fluent-mdl2--emoji-2]" @click="()=>{
            emojiShow=!emojiShow
          }">
        </span >
          <el-upload
          action="#"
          ref="elUploadRef"
          v-show="false"
          v-model:file-list="file"
          :limit="1"
          :on-change="handleChange"
          :auto-upload="false"
        >
        <template #trigger>
          <button 
          ref="elUploadButtonRef"
          >upload</button>
        </template>
      </el-upload>
          <span class="m-1 icon-[f7--folder]" @click="isOnlineProxy(sendFile)"></span>
          <!-- <span class="m-1 icon-[solar--scissors-outline]"></span> -->
          <!-- <span class="m-1 icon-[mingcute--message-3-line]"></span> -->
        </div>
        <div class="cursor-pointer flex flex-row">
          <span class="m-1 icon-[solar--phone-outline]" @click="isOnlineProxy(audioCall)"></span>
          <span class="m-1 icon-[ri--vidicon-line]" @click="isOnlineProxy(videoCall)"></span>
        </div>
      </el-row>
      <el-row>
        <el-col :span="22">
          <el-input
            type="textarea"
            show-word-limit
            resize="none"
            placeholder="请输入消息"
            v-model="messageText"
            @keydown.enter.native.prevent="isOnlineProxy(sendMessage)"
          ></el-input>
        </el-col>
        <el-col :span="2">
          <el-button class="mx-1 min-w-full min-h-full" type="primary"
          @click="isOnlineProxy(sendMessage)"
            >发送</el-button
          >
        </el-col>
      </el-row>
    </el-footer>
    <a ref="refA" v-show="false"></a>
  </el-container>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { ElMain, ElUpload, UploadProps, UploadUserFile } from "element-plus";
import useLibp2p from "@/hooks/useLibp2p";
import EmojiComponent from "@/components/EmojiComponent.vue";
import fileIcon from '@/assets/file.svg'
import usePeer from "@/hooks/usePeer";
const {libp2pManager}=useLibp2p()
const refMain=ref() as Ref<InstanceType<typeof ElMain>>;
const route=useRoute()
const friendId=computed(()=>{
  return route.params.user_id as string
})
const currentUser= libp2pManager.getChatUser()
const [messages]=await Promise.all([
ref(await libp2pManager.getMessageAggregation("",currentUser?.value.id,friendId.value))
])
const friend=ref(libp2pManager.getFriend(friendId.value)!)
watchEffect(async ()=>{
  messages.value=await libp2pManager.getMessageAggregation("",currentUser?.value.id,friendId.value)
  friend.value=(libp2pManager.getFriend(friendId.value))!
})
onMounted(()=>{
  nextTick(()=>{
      refMain.value.$el.scrollTop = refMain.value.$el.scrollHeight;
  })
})
const messageText = ref("");
async function sendMessage() {
  if(messageText.value){
    messages.value=await libp2pManager.sendMessage(friend.value,messageText.value);
    messageText.value = "";
  }else{
    ElMessage({
      type:"info",
      message:"不能发送空消息！"
    })
  }
}
const elUploadButtonRef = ref() as Ref<HTMLButtonElement>; // 创建ElUpload的引用
const elUploadRef=ref() as Ref<InstanceType<typeof ElUpload>>
async function sendFile(){
  elUploadButtonRef.value.click()
}

async function isOnlineProxy(handle:Function|(()=>{})){
  if(friend.value.isOnline){
    handle()
  }else{
    ElMessage({
      type:"info",
      message:`${friend.value.name}@${friend.value.id.slice(8)}...不在线，无法通信`    })
  }
}

const {peerManager}=usePeer()
peerManager.remotePeerId=friendId
peerManager.remoteUser=ref(friend)
async function audioCall(){
  await peerManager.speakCall(false,true)
}
async function videoCall(){
  await peerManager.speakCall(true,true)
}
const file = ref<UploadUserFile[]>([]);
const handleChange: UploadProps["onChange"] = async (uploadFile) => {
  libp2pManager.sendFile(friend.value,uploadFile.raw!)
  // const file=uploadFile.raw!
  // const fileString=await libp2pManager.fileToBase64(file)
  // const file2 = libp2pManager.base64ToFile(
  //           file.name,
  //           file.type,
  //           fileString
  //         );
  // console.log(file, file2, file.name, file.type);
  elUploadRef.value.clearFiles()
};

let countTime=0;
let timeout=ref<NodeJS.Timeout>()
const cyclicQuery=()=>{
  const activeTime=1000;
  const lazyTime=5000;
  const cyclicFunction=async ()=>{
    const messageTemplate=await libp2pManager.getMessageAggregation("",currentUser.value.id,friendId.value)
    if(messageTemplate.messages.length>messages.value.messages.length){
      countTime=0;
    }
    messages.value=messageTemplate
    clearTimeout(timeout.value)
    if(countTime<100){
      timeout.value=setTimeout(cyclicFunction,activeTime)
    }else{
      timeout.value=setTimeout(cyclicFunction,lazyTime)
    }
  }
  timeout.value= setTimeout(cyclicFunction,activeTime)
}
const refA=ref() as Ref<HTMLAreaElement>
const downloadFile = (file:File) => {
  const url = URL.createObjectURL(file);
  refA.value.href = url;
  refA.value.download = file.name;
  refA.value.click();
  URL.revokeObjectURL(url);
};

onMounted(()=>{
  cyclicQuery()
})

onUnmounted(()=>{
  clearTimeout(timeout.value)
})

// 简单的日期格式化函数示例
function formatTime(date: Date): string {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const emojiShow=ref(false)
const emojiClick=(emoji:string)=>{
    console.log(emoji)
    messageText.value+=emoji
}

// 可选：如果需要在消息列表变化时自动滚动到底部
watch(messages, (next,pre) => {
  if(pre.messages.length<next.messages.length){
    // 获取聊天框主体元素并滚动到底部
    nextTick(()=>{
      refMain.value.$el.scrollTop = refMain.value.$el.scrollHeight;
    })
  }
},{
  deep:true
});
</script>