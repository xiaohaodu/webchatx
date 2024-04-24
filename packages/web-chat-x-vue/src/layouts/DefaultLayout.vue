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
          <el-menu-item index="/channel?id=1">channel-1</el-menu-item>
          <el-menu-item index="/channel?id=2">channel-2</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/private_chat">
          <template #title>私聊</template>
          <el-menu-item index="/private_chat?id=1">private-chat-1</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/set">设置</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="flex items-center">
        <h2 class="text-xl font-bold">实时通讯</h2>
      </el-header>
      <el-divider></el-divider>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

// 添加处理菜单选中的方法
const handleMenuSelect = (index: string) => {
  console.log(`selected menu item: ${index}`);
};

const activeMenu = ref<string>();
const route = useRoute();
onMounted(() => {
  activeMenu.value = route.fullPath;
});
</script>
<style lang="scss" scoped>
.el-divider--horizontal {
  margin: 0;
}
</style>
