<template>
  <el-row class="flex justify-evenly items-center">
    <el-col :span="10">
      <el-row>
        <el-input type="string" v-model="nearPeerId" placeholder="Please input">
          <template #prepend>NearUserID</template>
          <template #append>
            <el-button type="primary" @click="call">call</el-button>
          </template>
        </el-input>
      </el-row>
      <el-row>
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
    <el-col :span="10">
      <el-row>
        <el-col>
          <el-input
            type="string"
            v-model="remotePeerId"
            placeholder="Please input"
          >
            <template #prepend>RemoteUserID</template>
          </el-input>
        </el-col>
      </el-row>
      <el-row>
        <video
          class="w-full h-96"
          ref="remoteVideoElement"
          id="remote-peer"
          autoplay
          playsinline
        >
          您的浏览器不支持视频标签。
        </video>
      </el-row>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref, unref } from "vue";
import usePeer from "@/hooks/overduehook/usePeer";

const nearVideoElement = ref<HTMLVideoElement>();
const remoteVideoElement = ref<HTMLVideoElement>();
const remotePeerId = ref("");
const caller = ref(false);

const { nearPeerId, startCall, answerCall } = unref(
  computed(() => {
    return usePeer({
      remotePeerId,
      nearVideoElement: nearVideoElement as Ref<HTMLVideoElement>,
      remoteVideoElement: remoteVideoElement as Ref<HTMLVideoElement>,
    });
  })
);

async function call() {
  // 确保在调用call之前已经加载了本地视频元数据
  if (
    !nearPeerId.value ||
    !startCall ||
    !nearVideoElement.value ||
    !remoteVideoElement.value
  )
    return;

  if (remotePeerId.value && remotePeerId.value !== nearPeerId.value) {
    await startCall!();
    caller.value = true;
  }
}

onMounted(() => {
  answerCall();
});
</script>
