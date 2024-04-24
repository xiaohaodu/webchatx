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
              <el-form-item label="密码" prop="password">
                <el-input
                  type="password"
                  autocomplete="new-password"
                  v-model="form.password"
                  placeholder="密码"
                >
                  <template #prefix>
                    <el-icon>
                      <el-icon-lock />
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
import useDb from "@/hooks/useDexie";
import ChatUser from "@/classes/ChatUser";
const { publicDb, createActivateUserDb } = useDb();
const refForm = ref<FormInstance>();
const loginOptions = [
  { label: "--- Local User ---", value: "local" },
  { label: "--- New User ---", value: "new" },
  { label: "--- Import User ---", value: "import" },
];
const localUser = ref(await publicDb.users.toArray());

const currentUser =
  localUser.value.length > 0
    ? ref<ChatUser>(localUser.value[0])
    : ref<ChatUser>();

const form = reactive({
  loginType: currentUser.value ? "local" : "new",
  name: "",
  password: "",
});

const rules = computed(() => {
  if (form.loginType === "new") {
    return reactive<FormRules<typeof form>>({
      loginType: [
        { required: true, message: "请选择登录方式", trigger: "change" },
      ],
      name: [{ required: true, message: "请输入昵称", trigger: "blur" }],
      password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    });
  }
});

const fileList = ref<UploadUserFile[]>([]);
async function submitForm() {
  if (!refForm.value) return;

  try {
    const valid = await refForm.value.validate();
    if (valid) {
      if (form.loginType === "new") {
        // 存储新用户的哈希密码
        const chatUser = await ChatUser.create(form.name, form.password, "");
        await publicDb.currentUser.put(chatUser);
        await publicDb.users.put(chatUser);
        await createActivateUserDb(chatUser, chatUser.id);
        router.push({ name: "Homepage" });
      } else if (form.loginType === "import") {
        // 假设parsedJsonData.value已经包含了用户信息
        if (
          parsedJsonData.value &&
          parsedJsonData.value.name &&
          parsedJsonData.value.hashedPassword
        ) {
          await publicDb.currentUser.put(parsedJsonData.value);
          await publicDb.users.put(parsedJsonData.value);
          router.push({
            name: "Homepage",
          });
        } else {
          ElMessageBox.alert("导入的JSON文件缺少必要的用户信息", "错误");
        }
      } else if (form.loginType === "local") {
        if (currentUser.value) {
          const currentUser_ = JSON.parse(JSON.stringify(currentUser.value));
          await publicDb.currentUser.put(currentUser_);
          await publicDb.users.put(currentUser_);
          router.push({ name: "Homepage" });
        } else {
          console.log("请选择本地用户");
        }
      }

      // 清空表单及临时变量
      form.name = "";
      form.password = "";
      parsedJsonData.value = null;
    } else {
      console.log("valid ", valid, "error submit!");
      return false;
    }
  } catch (error) {
    console.error("验证表单时发生错误:", error);
  }
}

const parsedJsonData = ref<any | null>(null);

// 处理文件变化事件，用于读取、解析JSON文件内容
const handleJsonFileChange: UploadProps["onChange"] = async (
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  // 检查文件是否存在且已上传完成
  if (uploadFile && uploadFile.raw?.type === "application/json") {
    try {
      const reader = new FileReader();
      reader.onload = function (e) {
        if (e.target?.result) {
          try {
            parsedJsonData.value = JSON.parse(e.target.result as string);
            // 可在此处添加额外的JSON结构或内容校验
          } catch (error) {
            console.error("解析JSON文件失败:", error);
            ElMessageBox({
              title: "错误",
              message: "所选文件内容不是有效的JSON格式",
              type: "error",
            });
            parsedJsonData.value = null;
          }
        }
      };
      reader.readAsText(uploadFile.raw);
    } catch (error) {
      console.error("读取JSON文件过程中发生错误:", error);
      ElMessageBox({
        title: "错误",
        message: "所选文件内容不是有效的JSON格式",
        type: "error",
      });
      parsedJsonData.value = null;
    }
  } else if (uploadFile) {
    // 清除已选择文件的状态
    parsedJsonData.value = null;
    uploadFiles.pop();
    ElMessageBox({
      title: "错误",
      message: "所选文件内容不是有效的JSON格式",
      type: "error",
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
