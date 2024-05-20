<template>
  <el-main>
    <el-card>
      <el-form label-position="left" label-width="auto">
        <el-form-item label="NoSpam混淆码">
          <div>
            NoSpam混淆码是您的WebChatX
            ID中可以随意改变的一部分。如果您收到骚扰的私聊信息，那就可以改变您的NoSpam混淆码。
          </div>
          <el-input disabled v-model="noSpam">
            <template #append>
              <el-button @click="generateNoSpam"
                >生成随机NoSpam混淆码</el-button
              >
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>
  </el-main>
</template>
<script lang="ts" setup>
import useLibp2p from "@/hooks/useLibp2p";
import {
  buildUserId,
  generateRandomHexChars,
  getObfuscationCodeFromUserId,
} from "@/utils";
const { libp2pManager } = useLibp2p();
const currentUser = libp2pManager.getChatUser();
const noSpam = ref(getObfuscationCodeFromUserId(currentUser.value.userId));
const generateNoSpam = () => {
  noSpam.value = generateRandomHexChars();
};
watch(noSpam, async () => {
  currentUser.value.userId = await buildUserId(
    currentUser.value.id,
    noSpam.value
  );
});
</script>
