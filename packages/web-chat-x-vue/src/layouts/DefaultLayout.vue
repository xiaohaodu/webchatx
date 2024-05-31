<template>
  <el-container style="height: 100vh">
    <!-- 添加 el-menu 组件作为侧边栏的导航菜单 -->
    <el-aside height="min-h-full" width="20vw">
      <el-menu
        router
        class="min-h-full"
        :default-openeds="['/channel', '/private_chat']"
        :default-active="activeMenu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/homepage">主页</el-menu-item>
        <el-menu-item index="/start_chatting">开启聊天</el-menu-item>
        <el-sub-menu index="/channel">
          <template #title>频道</template>
          <el-menu-item
            v-for="channel in channels"
            :index="`/channel/${channel.id}`"
          >
            <template #title>
              <div class="w-full text-ellipsis overflow-hidden">
                {{ channel.name + "@" + channel.id }}
              </div>
              <span
                :class="{
                  'online-dot': channel.friendIds.length,
                  'offline-dot': !channel.friendIds.length,
                }"
                class="dot ml-2"
              ></span>
              <span class="online-count ml-2">{{
                channel.friendIds.length
              }}</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/private_chat">
          <template #title>私聊</template>
          <el-menu-item
            v-show="reload"
            v-for="friend in friends"
            :index="`/private_chat/${friend.id}`"
          >
            <template #title>
              <div class="w-full text-ellipsis overflow-hidden">
                {{ friend.name + "@" + friend.id }}
              </div>
              <span
                :class="{
                  'online-dot': friend.isOnline,
                  'offline-dot': !friend.isOnline,
                }"
                class="dot ml-2"
              ></span>
            </template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/set">设置</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="flex items-center">
        <h2 class="text-xl font-bold">WebChatX</h2>
      </el-header>
      <el-divider></el-divider>
      <el-main>
        <router-view></router-view>
      </el-main>
      <peer-video-component></peer-video-component>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import ChatChannel from "@/classes/ChatChannel";
import ChatUser from "@/classes/ChatUser";
import useLibp2p from "@/hooks/useLibp2p";
import { useRouter } from "vue-router";

const { libp2pManager } = useLibp2p();
const friends = libp2pManager.getFriends() as Ref<ChatUser[]>;
const channels = libp2pManager.getChannels() as Ref<ChatChannel[]>;
// 添加处理菜单选中的方法
const handleMenuSelect = (index: string) => {
  console.log(`selected menu item: ${index}`);
};
const activeMenu = ref<string>();
const router = useRouter();
watchEffect(() => {
  activeMenu.value =
    (router.currentRoute.value.meta.activeMenu as string | undefined) ||
    router.currentRoute.value.fullPath;
});
const reload = ref(true);
let timeout: NodeJS.Timeout;
const intervalFriends = () => {
  timeout = setTimeout(() => {
    clearTimeout(timeout);
    reload.value = false;
    nextTick(() => {
      reload.value = true;
    });
    intervalFriends();
  }, 5000);
};
onMounted(() => {
  intervalFriends();
});
onUnmounted(() => {
  clearTimeout(timeout);
});
</script>
<style lang="scss" scoped>
.el-divider--horizontal {
  margin: 0;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.online-dot {
  background-color: green; /* 在线时为绿色 */
}

.offline-dot {
  background-color: gray; /* 不在线时为灰色 */
}

.online-count {
  margin-right: 4px; /* 根据需要调整与在线点的距离 */
  color: #4a4a4a; /* 文字颜色，根据你的设计调整 */
  font-size: 12px; /* 文字大小，根据需要调整 */
}
</style>
