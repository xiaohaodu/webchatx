<template>
  <el-main>
    <el-card>
      <el-form label-position="left" label-width="auto">
        <el-form-item label="中继服务器(multiaddr)">
          <el-input v-model="user.relayMultiaddrs[0]"></el-input>
        </el-form-item>
        <el-form-item label="stun/turn服务器">
          <el-input v-model="user.stunTurn[0]"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save()">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-main>
</template>
<script lang="ts" setup>
import useDexie from "@/hooks/useDexie";
import { multiaddr } from "@multiformats/multiaddr";
const { activatedUserDb, publicDb } = useDexie();
const user = ref((await activatedUserDb.info.limit(1).first())!);
const timer = ref<NodeJS.Timeout | undefined>(undefined);
const save = () => {
  try {
    multiaddr(user.value.relayMultiaddrs[0]);
  } catch (error: any) {
    console.log(error.message);
    user.value.relayMultiaddrs[0] = "";
    user.value.stunTurn[0] = "";
    return;
  }
  // 如果仍在任务在队列的话，清除该宏任务，重新设置任务
  timer.value && clearTimeout(timer.value);
  timer.value = setTimeout(async () => {
    // 当前用户信息更新时user表中信息也要同步更新
    const user_ = JSON.parse(JSON.stringify(user.value));
    await activatedUserDb.info.put(user_);
    await publicDb.currentUser.put(user_);
    await publicDb.users.put(user_);
    clearTimeout(timer.value);
    timer.value = undefined;
  }, 100);
};
</script>
