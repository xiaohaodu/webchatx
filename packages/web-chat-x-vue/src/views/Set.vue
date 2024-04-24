<template>
  <el-container>
    <!-- 用户头像与昵称区域 -->
    <el-header class="shadow flex items-center">
      <el-menu
        :router="true"
        mode="horizontal"
        :key="route.fullPath"
        class="w-full"
        :ellipsis="false"
        :default-active="route.fullPath"
      >
        <el-menu-item index="/set/userInfo">
          <template #title>用户信息</template>
        </el-menu-item>
        <el-menu-item index="/set/general">
          <template #title>通用</template>
        </el-menu-item>
        <el-menu-item index="/set/privacy">
          <template #title>隐私</template>
        </el-menu-item>
        <el-menu-item index="/set/audio_video">
          <template #title>音频/视频</template>
        </el-menu-item>
        <el-menu-item index="/set/advanced">
          <template #title>高级</template>
        </el-menu-item>
        <el-menu-item index="/set/about">
          <template #title>关于</template>
        </el-menu-item>
      </el-menu>
    </el-header>
    <router-view></router-view>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>
