<template>
  <el-main>
    <el-card>
      <el-form label-position="left" label-width="auto">
        <!-- <el-form-item label="中继服务器(multiaddr)">
          <el-input v-model="user.relayMultiaddrs[0]"></el-input>
        </el-form-item>
        <el-form-item label="stun/turn服务器">
          <el-input v-model="user.stunTurn[0]"></el-input>
        </el-form-item> -->
        <el-form-item label="导出数据">
          <el-button type="primary" @click="exportUserDB(true)">
            <span class="icon-[dashicons--database-export]"></span
            >导出本地全部用户</el-button
          >
          <el-button type="primary" @click="exportUserDB(false)">
            <span class="icon-[dashicons--database-export]"></span
            >导出当前用户</el-button
          >
        </el-form-item>
        <el-form-item label="退出登录">
          <el-button type="primary" @click="loginOut">
            <span class="icon-[dashicons--exit]"></span>退出登录</el-button
          >
        </el-form-item>
        <el-form-item label="连接本地全功能节点">
          <el-switch v-model="enableLocalNode"></el-switch>
        </el-form-item>
      </el-form>
    </el-card>
    <a ref="refA" v-show="false"></a>
  </el-main>
</template>
<script lang="ts" setup>
import useDexie from "@/hooks/useDexie";
import useLibp2p from "@/hooks/useLibp2p";
import usePeer from "@/hooks/usePeer";
import { useRouter } from "vue-router";
const router = useRouter();
// import { multiaddr } from "@multiformats/multiaddr";
const { databaseManager } = useDexie();
const { libp2pManager } = useLibp2p();
const enableLocalNode = ref(libp2pManager.enableLocalNode);
watchEffect(() => {
  libp2pManager.enableLocalNode = enableLocalNode.value;
});

// const user = ref(
//   (await databaseManager.activatedUserDb.info.limit(1).first())!
// );
// const timer = ref<NodeJS.Timeout | undefined>(undefined);

const refA = ref() as Ref<HTMLAreaElement>;
const exportUserDB = async (all: boolean = false) => {
  const file = all
    ? (await databaseManager.exportAllUserDB())!
    : (await databaseManager.exportCurrentUserDB())!;

  const url = URL.createObjectURL(file);
  refA.value.href = url;
  refA.value.download = file.name;
  refA.value.click();
  URL.revokeObjectURL(url);
};
const { resetPeerManager } = usePeer();
const { resetLibp2p } = useLibp2p();
const { resetDatabaseManager } = useDexie();
const loginOut = async () => {
  await databaseManager.deleteCurrentUser();
  resetPeerManager();
  await resetDatabaseManager();
  resetLibp2p();
  router.push({ name: "Login" });
};
// const save = () => {
//   try {
//     multiaddr(user.value.relayMultiaddrs[0]);
//   } catch (error: any) {
//     console.log(error.message);
//     user.value.relayMultiaddrs[0] = "";
//     user.value.stunTurn[0] = "";
//     return;
//   }
//   // 如果仍在任务在队列的话，清除该宏任务，重新设置任务
//   timer.value && clearTimeout(timer.value);
//   timer.value = setTimeout(async () => {
//     // 当前用户信息更新时user表中信息也要同步更新
//     await databaseManager.activatedUserDb.info.put(user.value);
//     await databaseManager.publicDb.currentUser.put(user.value);
//     await databaseManager.publicDb.users.put(user.value);
//     clearTimeout(timer.value);
//     timer.value = undefined;
//   }, 100);
// };
</script>
