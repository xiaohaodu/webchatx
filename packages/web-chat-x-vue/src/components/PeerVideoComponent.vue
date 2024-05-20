<template>
  <div>
    <el-dialog
      v-model="elDialogVisible"
      :modal="false"
      modal-class="dialog-modal"
      :lock-scroll="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :show-close="false"
      draggable
      style="
        margin: 0;
        position: fixed;
        top: 5vh;
        right: 5vw;
        min-width: 200px;
        max-width: 300px;
        min-height: 350px;
        max-height: 450px;
      "
      class="flex flex-col items-center justify-between"
    >
      <template #header>
        <div class="flex items-center">
          <img
            :src="peerManager.remoteUser?.value.avatar"
            alt="User Avatar"
            class="w-12 h-12 rounded-full mr-2"
          />
          <el-tooltip
            :content="`${peerManager.remoteUser?.value.name}@${peerManager.remoteUser?.value.id}`"
            placement="top"
          >
            <p class="text-gray-800 break-all line-clamp-1 w-36 text-ellipsis">
              {{
                `${peerManager.remoteUser?.value.name}@${peerManager.remoteUser?.value.id}`
              }}
            </p>
          </el-tooltip>
        </div>
      </template>
      <video
        class="absolute inset-0 -z-10 w-full h-full"
        ref="remoteVideoElement"
        autoplay
        playsinline
      >
        您的浏览器不支持视频标签。
      </video>
      <video
        class="absolute -z-10 top-2 right-2 w-10 h-20"
        ref="nearVideoElement"
        autoplay
        playsinline
      >
        您的浏览器不支持视频标签。
      </video>

      <template #footer>
        <div class="flex items-center justify-center">
          <el-button type="danger" @click="hungUp">挂断</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import usePeer from "@/hooks/usePeer";
const { peerManager } = usePeer();
const elDialogVisible = ref(true);
const remoteVideoElement = ref() as Ref<HTMLVideoElement>;
const nearVideoElement = ref() as Ref<HTMLVideoElement>;
peerManager.remoteVideoElement = remoteVideoElement;
peerManager.nearVideoElement = nearVideoElement;
peerManager.elDialogVisible = elDialogVisible;
onMounted(() => {
  elDialogVisible.value = false;
  nextTick(() => {
    peerManager.listenCall();
  });
});
onUnmounted(() => {
  peerManager.releaseMediaStream();
});

function hungUp() {
  elDialogVisible.value = false;
  peerManager.mediaConnect.value!.close();
}
</script>
<style lang="scss">
/**取消遮罩层 */
.dialog-modal {
  position: static !important;
  .el-overlay-dialog {
    position: static;
  }
}
</style>
