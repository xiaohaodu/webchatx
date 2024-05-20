<template>
  <el-row class="flex justify-evenly items-center">
    <el-col :span="10">
      <el-row>
        <el-button type="primary" @click="">call</el-button>
      </el-row>
      <el-row class="bg-green-400">
        <video
          class="w-full h-96"
          ref="nearVideoElement"
          id="near-peer"
          autoplay
          playsinline
        >
          您的浏览器不支持视频标签。
        </video>
      </el-row>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup></script>
