<template>
  <el-main>
    <el-card>
      <template #header>
        <h2>音频设置</h2>
      </template>
      <el-form label-position="left" label-width="auto">
        <el-form-item label="播放设备">
          <el-select
            v-model="currentSpeaker.label"
            placeholder="Select"
            size="large"
            style="width: 240px"
          >
            <el-option
              v-for="item in speakerDevices"
              :key="item.label"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="麦克风设备">
          <el-select
            v-model="currentMicrophone.label"
            placeholder="Select"
            size="large"
            style="width: 240px"
          >
            <el-option
              v-for="item in microphoneDevices"
              :key="item.label"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt-4">
      <template #header>
        <h2>视频设置</h2>
      </template>
      <el-form label-position="left" label-width="auto">
        <el-form-item label="视频设备">
          <el-select
            v-model="currentVideo.label"
            placeholder="Select"
            size="large"
            style="width: 240px"
          >
            <el-option
              v-for="item in videoDevices"
              :key="item.label"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </el-main>
</template>
<script lang="ts" setup>
// import useLibp2p from "@/hooks/useLibp2p";
// const { libp2pManager } = useLibp2p();

import usePeer from "@/hooks/usePeer";
const { peerManager } = usePeer();
const videoDevices = ref((await peerManager.getCameras()).slice(0, 1));
const currentVideo = ref<MediaDeviceInfo>(videoDevices.value[0]);
const microphoneDevices = ref((await peerManager.getMicrophones()).slice(0, 1));
const currentMicrophone = ref<MediaDeviceInfo>(microphoneDevices.value[0]);
const speakerDevices = ref((await peerManager.getSpeakers()).slice(0, 1));
const currentSpeaker = ref<MediaDeviceInfo>(speakerDevices.value[0]);
</script>
