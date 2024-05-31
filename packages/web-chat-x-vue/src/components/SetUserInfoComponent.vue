<template>
  <el-main>
    <el-card>
      <!-- 昵称、email、phone、location和role的展示 -->
      <el-form :model="user" label-position="left" label-width="auto">
        <!-- 用户头像与昵称区域 -->
        <el-form-item label="头像">
          <img
            ref="avatarImage"
            @click="switchAvatarUploader(!isEditingAvatar)"
            class="w-10 h-10 rounded-full mr-2 cursor-pointer"
            :src="user.avatar"
            alt="User Avatar"
          />
        </el-form-item>
        <el-form-item label="名字">
          <el-input v-model="user.name"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="user.email"></el-input>
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="user.phone"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="user.location"></el-input>
        </el-form-item>
        <el-form-item label="职业">
          <el-input v-model="user.role"></el-input>
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="user.description"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 头像上传模态框或组件 -->
    <el-dialog
      v-model="isEditingAvatar"
      width="30%"
      modal
      title="更换头像"
      append-to-body
      class="flex flex-col justify-center items-center"
    >
      <el-upload
        list-type="picture-card"
        v-model:file-list="avatarFileList"
        :limit="1"
        :auto-upload="false"
        accept=".jpg, .jpeg, .png"
      >
        <el-button slot="trigger" size="small">选择图片</el-button>
        <div slot="tip">只能上传jpg/png文件，且不超过5MB</div>
      </el-upload>
      <span
        slot="footer"
        class="flex flex-row justify-between items-center pt-2 w-full"
      >
        <el-button @click="isEditingAvatar = false">取消</el-button>
        <el-button type="primary" @click="submitAvatar">确定</el-button>
      </span>
    </el-dialog>
  </el-main>
</template>

<script setup lang="ts">
import { UploadUserFile } from "element-plus";
import useDexie from "@/hooks/useDexie";
import { cloneDeep } from "lodash-es";
import useLibp2p from "@/hooks/useLibp2p";
const { libp2pManager } = useLibp2p();
const { databaseManager } = useDexie();
const user = ref(
  (await databaseManager.activatedUserDb.info.limit(1).first())!
);
const isEditingAvatar = ref(false);
const avatarFileList = ref<UploadUserFile[]>([]);

// 打开头像上传器
const switchAvatarUploader = (flag: boolean) => {
  isEditingAvatar.value = flag;
};

// 提交头像更改
const submitAvatar = () => {
  if (avatarFileList.value.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      if (e.target?.readyState === FileReader.DONE) {
        if (e.target.result) {
          user.value.avatar = e.target.result as string; // 将base64格式的图片数据赋值给用户头像
        }
      }
    };
    reader.readAsDataURL(avatarFileList.value[0].raw as File);
    switchAvatarUploader(false);
    avatarFileList.value = [];
  } else {
    ElMessage.warning("请先选择图片!");
  }
};
const timer = ref<NodeJS.Timeout>();
const save = () => {
  // 如果仍在任务在队列的话，清除该宏任务，重新设置任务
  timer.value && clearTimeout(timer.value);
  const AlertMessage = ref("数据更新中...");
  const AlertLoading = ref(true);
  ElMessageBox({
    title: "更新用户信息",
    message: () =>
      h(
        ElButton,
        {
          id: "message",
          loading: AlertLoading.value,
          type: "primary",
        },
        () => AlertMessage.value
      ),
    center: true,
    showConfirmButton: false,
    distinguishCancelAndClose: true,
    closeOnClickModal: false,
    closeOnPressEscape: false,
  });
  timer.value = setTimeout(async () => {
    const _user = cloneDeep(user.value);
    // 当前用户信息更新时user表中信息也要同步更新
    await libp2pManager.putChatUser(_user);
    clearTimeout(timer.value);
    ElMessageBox.close();
  }, 100);
};
</script>
