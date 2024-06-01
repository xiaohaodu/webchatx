<template>
  <div class="min-h-screen bg-[#1791f2] flex justify-center items-center">
    <div class="w-full max-w-md">
      <h2 class="text-3xl font-extrabold font-mono text-center text-[#f5f5f5]">
        欢迎!
      </h2>
      <el-card shadow="never" class="bg-[#f5f5f5] text-gray-800">
        <el-form
          :model="form"
          label-position="top"
          ref="refForm"
          :rules="rules"
          class="mt-8"
        >
          <el-form-item label="Log in as" prop="loginType">
            <el-select
              v-model="form.loginType"
              placeholder="Log in as"
              @change="$forceUpdate()"
            >
              <el-option
                v-for="(option, index) in loginOptions"
                :key="index"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <transition name="fade">
            <div v-if="form.loginType === 'import'">
              <!-- 添加 el-upload 组件 -->
              <el-upload
                v-model:file-list="fileList"
                :auto-upload="false"
                accept=".json"
                @change="handleJsonFileChange"
                :limit="1"
              >
                <el-button type="primary">选择并上传JSON文件</el-button>
              </el-upload>
            </div>
          </transition>

          <transition name="fade">
            <div v-if="form.loginType === 'new'">
              <el-form-item label="昵称" prop="name">
                <el-input
                  type="string"
                  autocomplete="username"
                  v-model="form.name"
                  placeholder="昵称"
                >
                  <template #prefix>
                    <el-icon>
                      <el-icon-user />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </div>
          </transition>

          <transition name="fade">
            <div v-if="form.loginType === 'local'">
              <el-select
                v-model="currentUser"
                value-key="id"
                placeholder="Log in as"
                @change="$forceUpdate()"
              >
                <el-option
                  v-for="user in localUser"
                  :key="user.id"
                  :label="user.name + '@' + user.id"
                  :value="user"
                ></el-option>
              </el-select>
            </div>
          </transition>

          <!-- <el-checkbox v-show="false" v-model="rememberMe"
            >存储密码</el-checkbox
          > -->
          <el-button
            type="primary"
            block
            class="mt-4 w-full"
            @click="submitForm()"
            >Continue</el-button
          >
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { router } from "@/router";
import {
  FormInstance,
  FormRules,
  UploadUserFile,
  UploadProps,
  UploadFile,
  UploadFiles,
} from "element-plus";
import ChatUser from "@/classes/ChatUser";
import useLibp2p from "@/hooks/useLibp2p";
import { peerIdFromPeerId } from "@libp2p/peer-id";
import { cloneDeep } from "lodash-es";
import useDb from "@/hooks/useDexie";
const refForm = ref<FormInstance>();
const { libp2pManager } = useLibp2p();
const { databaseManager } = useDb();
const loginOptions = [
  { label: "--- Local User ---", value: "local" },
  { label: "--- New User ---", value: "new" },
  { label: "--- Import User ---", value: "import" },
];
const localUser = ref(await libp2pManager.getPublicDbUsers());

const currentUser =
  localUser.value.length > 0
    ? ref<ChatUser>(localUser.value[0])
    : ref<ChatUser>();

const form = reactive({
  loginType: currentUser.value ? "local" : "new",
  name: "",
});

const rules = computed(() => {
  if (form.loginType === "new") {
    return reactive<FormRules<typeof form>>({
      loginType: [
        { required: true, message: "请选择登录方式", trigger: "change" },
      ],
      name: [{ required: true, message: "请输入昵称", trigger: "blur" }],
    });
  }
});
const fileList = ref<UploadUserFile[]>([]);
async function submitForm() {
  if (!refForm.value) return;
  try {
    const valid = await refForm.value.validate();
    if (valid) {
      const AlertMessage = ref("初始化/加载本地数据中...");
      const AlertLoading = ref(true);
      ElMessageBox({
        title: "登录",
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
      if (form.loginType === "new") {
        // 存储新用户的哈希密码
        const chatUser = await ChatUser.create(form.name, "", [], [], [], "");
        await libp2pManager.createNewUser(chatUser);
        await libp2pManager.createActivateUserDb(chatUser, chatUser.id);
        await libp2pManager.createLibp2pNode(chatUser.peerId);
        await libp2pManager.startLibp2pNode();
        await libp2pManager.setChatUser(chatUser);
      } else if (form.loginType === "import") {
        await databaseManager.importDB(dbUploadFile.value!.raw!);
        const interval = async () => {
          localUser.value = await libp2pManager.getPublicDbUsers();
          clearTimeout(timer);
          if (localUser.value.length) {
            currentUser.value = localUser.value[0];
            form.loginType = "local";
          } else {
            timer = setTimeout(interval, 500);
          }
        };
        let timer = setTimeout(interval, 500);
        // 假设parsedJsonData.value已经包含了用户信息
        //   ElMessageBox.alert("导入的JSON文件缺少必要的用户信息", "错误");
      } else if (form.loginType === "local") {
        if (currentUser.value) {
          const currentUser_ = cloneDeep(currentUser.value);
          await databaseManager.setCurrentUser(currentUser_);
          await libp2pManager.createActivateUserDb(
            currentUser_,
            currentUser_.id
          );
          const peerId = peerIdFromPeerId(currentUser_.peerId);
          await libp2pManager.createLibp2pNode(peerId);
          await libp2pManager.startLibp2pNode();
          await libp2pManager.setChatUser(currentUser_);
        } else {
          ElMessage({
            type: "info",
            message: "请选择本地用户",
          });
        }
      }
      ElMessageBox.close();
      router.push({ name: "Homepage" });
      // 清空表单及临时变量
      form.name = "";
    } else {
      console.log("valid ", valid, "error submit!");
    }
  } catch (error) {
    console.error("验证表单时发生错误:", error);
  }
}

const dbUploadFile = ref<UploadFile>();

// 处理文件变化事件，用于读取、解析JSON文件内容
const handleJsonFileChange: UploadProps["onChange"] = async (
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  dbUploadFile.value = uploadFile;
  // 检查文件是否存在且已上传完成
  if (!(uploadFile && uploadFile.raw?.type === "application/json")) {
    // 清除已选择文件的状态
    uploadFiles.pop();
    ElMessage({
      type: "error",
      message: "所选文件内容不是有效的JSON格式",
    });
  }
};
</script>
<style lang="scss" scoped>
:deep(.el-form-item__label) {
  color: #000000;
  font-weight: 800;
  font-size: medium;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
