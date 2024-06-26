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
        <div v-if="communication.caller" class="flex items-center">
          <img
            :src="caller?.avatar"
            alt="User Avatar"
            class="w-12 h-12 rounded-full mr-2"
          />
          <el-tooltip
            :content="`${caller?.name}@${caller?.id}`"
            placement="top"
          >
            <p class="text-gray-800 break-all line-clamp-1 w-36 text-ellipsis">
              {{ `${caller?.name}@${caller?.id}` }}
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
        <div
          class="flex items-center justify-center"
          v-show="communication.await"
        >
          {{ communication.video ? "视频请求" : "音频请求" }}
        </div>
        <div class="flex items-center justify-center">
          <el-button
            v-show="!communication.call && communication.await"
            type="primary"
            @click="accept"
            >接听</el-button
          >
          <el-button
            v-show="!communication.call && communication.await"
            type="danger"
            @click="reject"
            >拒绝</el-button
          >
          <el-button
            v-show="
              communication.call ||
              (!communication.call && !communication.await)
            "
            type="danger"
            @click="hungUp"
            >挂断</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import useLibp2p from "@/hooks/useLibp2p";
import usePeer from "@/hooks/usePeer";
import { useRoute } from "vue-router";
const { peerManager } = usePeer();
const { libp2pManager } = useLibp2p();
const currentUser = libp2pManager.getChatUser();
peerManager.createPeer({
  nearPeerId: currentUser.value.id,
});
const elDialogVisible = ref(true);
const remoteVideoElement = ref() as Ref<HTMLVideoElement>;
const nearVideoElement = ref() as Ref<HTMLVideoElement>;
const route = useRoute();
const friendId = computed(() => {
  return route.params.user_id as string;
});
const friend = computed(() => {
  return libp2pManager.getFriend(friendId.value)!;
});
peerManager.remotePeerId = friendId;
peerManager.remoteUser = friend;
const communication = ref({
  answer: "",
  caller: "",
  await: true,
  call: false,
  accepted: false,
  video: false,
  audio: false,
});
const caller = computed(() => {
  return (
    (communication.value.caller &&
      libp2pManager.getFriend(communication.value.caller)) ||
    friend.value
  );
});
peerManager.remoteVideoElement = remoteVideoElement;
peerManager.nearVideoElement = nearVideoElement;
peerManager.elDialogVisible = elDialogVisible;
peerManager.communication = communication;
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
  peerManager.releaseMediaStream();
}

function reject() {
  communication.value.accepted = false;
  communication.value.await = false;
  elDialogVisible.value = false;
}

function accept() {
  communication.value.await = false;
  communication.value.accepted = true;
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
