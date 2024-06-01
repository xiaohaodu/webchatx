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

// 使用 Promise.all 并行获取所有设备信息
const [videoDevicesRaw, microphoneDevicesRaw, speakerDevicesRaw] =
  await Promise.all([
    peerManager.getCameras(),
    peerManager.getMicrophones(),
    peerManager.getSpeakers(),
  ]);

// 由于您只想取每个设备类型的前一个设备，所以我们使用 slice 方法
const videoDevices = ref(videoDevicesRaw.slice(0, 1));
const currentVideo = ref<MediaDeviceInfo>(videoDevices.value[0] ?? undefined);

const microphoneDevices = ref(microphoneDevicesRaw.slice(0, 1));
const currentMicrophone = ref<MediaDeviceInfo>(
  microphoneDevices.value[0] ?? undefined
);

const speakerDevices = ref(speakerDevicesRaw.slice(0, 1));
const currentSpeaker = ref<MediaDeviceInfo>(
  speakerDevices.value[0] ?? undefined
);
</script>
