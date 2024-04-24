<template>
  <el-row>
    <el-col :span="24" class="p-2">
      <h2>创建/连接-群组与私聊</h2>
    </el-col>
    <el-col :span="12" class="p-5">
      <h2>创建-群组</h2>
      <el-form
        label-position="top"
        ref="refChannelForm"
        :model="channelFormData"
        :rules="rules"
      >
        <el-form-item label="名字" prop="name">
          <el-input
            v-model="channelFormData.name"
            placeholder="频道名称，例如 'd-chat' 等等。"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            show-word-limit
            resize="none"
            v-model="channelFormData.description"
            placeholder="简单的介绍您的频道含义，保持简短。"
          ></el-input>
        </el-form-item>
        <el-button @click="submitForm">创建</el-button>
      </el-form>
    </el-col>
    <el-col :span="12" class="p-5">
      <h2>请求-私聊</h2>
      <!-- 私聊表单可能需要不同的字段，这里假设使用用户ID -->
      <el-form
        label-position="top"
        ref="refPrivateChatForm"
        :model="privateChatFormData"
        :rules="privateChatRules"
      >
        <el-form-item label="用户唯一ID" prop="publicKey">
          <el-input
            type="string"
            v-model="privateChatFormData.publicKey"
            placeholder="用户唯一ID"
          ></el-input>
        </el-form-item>
        <el-button @click="submitPrivateChatForm">发送好友请求</el-button>
      </el-form>
    </el-col>
    <el-col :span="24" class="p-5">
      <el-table :data="channels">
        <el-table-column prop="name" label="名字"></el-table-column>
        <el-table-column prop="subscribers" label="订阅者"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { FormInstance, FormRules } from "element-plus";

const channels = [
  {
    name: "memeee",
    subscribers: 11,
    description: "Revélez votre talent",
  },
  // ... other channel data
];

const refChannelForm = ref<FormInstance>();
const refPrivateChatForm = ref<FormInstance>();

const channelFormData = reactive({
  name: "",
  description: "",
});

const rules = reactive<FormRules<typeof channelFormData>>({
  name: [{ required: true, message: "请输入频道名称", trigger: "change" }],
  description: [
    { required: true, message: "请输入频道描述", trigger: "change" },
  ],
});

const privateChatFormData = reactive({
  username: "",
  publicKey: "",
});

const privateChatRules = reactive<FormRules<typeof privateChatFormData>>({
  username: [
    { required: true, message: "请输入对方用户名", trigger: "change" },
  ],
  publicKey: [
    { required: true, message: "请输入要发送的消息", trigger: "change" },
  ],
});

async function submitForm() {
  if (!refChannelForm.value) return;
  if (await refChannelForm.value.validate()) {
    try {
      await createOrConnectChannel(channelFormData);
      // 处理响应，例如更新表格数据等
    } catch (error) {
      console.error("Error submitting channel form:", error);
    }
  }
}

async function submitPrivateChatForm() {
  if (!refPrivateChatForm.value) return;
  if (await refPrivateChatForm.value.validate()) {
    try {
      await sendMessage(privateChatFormData);
      // 处理响应，例如显示成功提示、清空输入框等
    } catch (error) {
      console.error("Error submitting private chat form:", error);
    }
  }
}

// 示例函数，实际应用中应替换为真实接口调用
async function createOrConnectChannel(_channelData: typeof channelFormData) {
  // 发送 POST 请求至相应 API，如 '/api/channels'
}

async function sendMessage(_chatData: typeof privateChatFormData) {
  // 发送 POST 请求至相应 API，如 '/api/messages'
}
</script>
