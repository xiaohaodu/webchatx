<template>
  <el-container class="h-full flex">
    <el-header class="bg-gray-100 flex items-center justify-between">
      <h2 class="text-lg font-semibold">{{ channelInfo?.name }}</h2>
      <span class="text-gray-400 text-sm"
        >{{ channelInfo?.friends.length }} people chatting</span
      >
    </el-header>
    <el-main ref="refMain" class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'p-2 flex flex-col flex-shrink-0 justify-start',
          message.user.id===currentUser.id && 'justify-end',
        ]"
      >
        <div
          :class="[
            'flex flex-row items-start',
            message.user.id===currentUser.id && 'flex-row-reverse',
          ]"
        >
          <img
            v-if="message.user.avatar"
            :src="message.user.avatar"
            alt="User Avatar"
            class="w-8 h-8 rounded-full"
          />
          <p
            :class="[
              message.user.id===currentUser.id ? 'text-right' : 'text-left',
              'text-gray-600',
            ]"
          >
            {{ message.user.name }}
            <div
            :class="[
              'flex flex-col self-end',
              message.user.id===currentUser.id ? 'text-right' : 'text-left',
            ]"
          >
            <span class="text-gray-600">
              {{ message.text }}
            </span>
            <span class="text-gray-400 text-xs">{{
              formatTime(String(message.time.getTime()))
            }}</span>
          </div>
          </p>
          
        </div>
      </div>
    </el-main>
    <el-footer class="flex flex-col flex-shrink-0" height="auto">
      <el-row class="flex flex-row justify-between">
        <div>
          <span class="m-1 icon-[fluent-mdl2--emoji-2]"></span>
          <span class="m-1 icon-[f7--folder]"></span>
          <span class="m-1 icon-[solar--scissors-outline]"></span>
          <span class="m-1 icon-[mingcute--message-3-line]"></span>
        </div>
        <div>
          <span class="m-1 icon-[solar--phone-outline]"></span>
          <span class="m-1 icon-[ri--vidicon-line]"></span>
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
            @keyup.enter.native="sendMessage"
          ></el-input>
        </el-col>
        <el-col :span="2">
          <el-button class="mx-1 min-w-full min-h-full" type="primary"
            >发送</el-button
          >
        </el-col>
      </el-row>
    </el-footer>
  </el-container>
</template>

<script lang="ts" setup>
import useDb from "@/hooks/useDexie";
import { useRoute } from "vue-router";
import { ElMain } from "element-plus";
import ChatMessage from '@/classes/ChatMessage'
const {activatedUserDb}=useDb()
const refMain=ref() as Ref<InstanceType<typeof ElMain>>;
const route=useRoute()
const channelId=route.query.id as string

const messages =  ref(await activatedUserDb.transaction('r',activatedUserDb.messages, async ()=>{
return activatedUserDb.messages.where('channel.id').equals(channelId).toArray()
}));

const channelInfo = (await activatedUserDb.channels.get(channelId))!;
const currentUser= (await activatedUserDb.info.limit(1).first())!
const messageText = ref("");

async function sendMessage() {
  const newMessage =await ChatMessage.create(currentUser,channelInfo,messageText.value)
  messageText.value = "";
  messages.value.push(newMessage);
}

// 简单的日期格式化函数示例
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 可选：如果需要在消息列表变化时自动滚动到底部
watch(messages, () => {
  // 获取聊天框主体元素并滚动到底部
  nextTick(()=>{
     refMain.value.$el.scrollTop = refMain.value.$el.scrollHeight;
  })
},{
  deep:true
});
</script>