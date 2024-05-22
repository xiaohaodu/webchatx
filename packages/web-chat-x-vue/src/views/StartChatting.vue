<template>
  <el-row>
    <el-col :span="24" class="p-2">
      <h2>创建/连接-群组与私聊</h2>
    </el-col>
    <el-col :span="8" class="p-5">
      <h2>创建-群组</h2>
      <el-form
        label-position="top"
        ref="refCreateChannelForm"
        :model="createChannelFormData"
        :rules="createChannelRules"
      >
        <el-form-item label="名字" prop="name">
          <el-input
            type="string"
            v-model="createChannelFormData.name"
            placeholder="频道名称，例如 'd-chat' 等等。"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            show-word-limit
            resize="none"
            v-model="createChannelFormData.description"
            placeholder="简单的介绍您的频道含义，保持简短。"
          ></el-input>
        </el-form-item>
        <el-button @click="createChannel">创建</el-button>
      </el-form>
    </el-col>
    <!-- 加入群组 -->
    <el-col :span="8" class="p-5">
      <h2>加入-群组</h2>
      <el-form
        label-position="top"
        ref="refJoinChannelForm"
        :model="joinChannelFormData"
        :rules="joinChannelRules"
      >
        <el-form-item label="频道唯一标识" prop="uniqueId">
          <el-input
            type="string"
            v-model="joinChannelFormData.uniqueId"
            placeholder="频道名称@唯一标识码"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="打招呼" prop="description">
          <el-input
            type="textarea"
            show-word-limit
            resize="none"
            v-model="joinChannelFormData.description"
            placeholder="简单的介绍您，保持简短。"
          ></el-input>
        </el-form-item>
        <el-button @click="joinChannel">加入</el-button>
      </el-form>
    </el-col>
    <el-col :span="8" class="p-5">
      <h2>请求-私聊</h2>
      <!-- 私聊表单可能需要不同的字段，这里假设使用用户ID -->
      <el-form
        label-position="top"
        ref="refPrivateChatForm"
        :model="privateChatFormData"
        :rules="privateChatRules"
      >
        <el-form-item label="用户唯一ID" prop="userId">
          <el-input
            type="textarea"
            resize="none"
            v-model="privateChatFormData.userId"
            placeholder="用户唯一ID"
          ></el-input>
        </el-form-item>
        <el-form-item label="好友验证消息" prop="validationMessage">
          <el-input
            type="textarea"
            show-word-limit
            resize="none"
            v-model="privateChatFormData.validationMessage"
            :placeholder="privateChatFormData.defaultValidationMessage"
          ></el-input>
        </el-form-item>
        <el-button @click="friendRequest">发送好友请求</el-button>
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
import useDb from "@/hooks/useDexie";
import useLibp2p from "@/hooks/useLibp2p";
import { isValidUserId, getPeerIdFromUserId } from "@/utils";
import { peerIdFromString } from "@libp2p/peer-id";
import { FormInstance, FormRules } from "element-plus";
import { useRouter } from "vue-router";
const { databaseManager } = useDb();
const refPrivateChatForm = ref<FormInstance>();
const currentUser = await databaseManager.activatedUserDb.info.limit(1).first();
const privateChatFormData = reactive({
  userId: "",
  validationMessage: "",
  defaultValidationMessage: `我是${currentUser?.name},我们开始使用WebChatX聊天吧!`,
});
const privateChatRules = reactive<FormRules<typeof privateChatFormData>>({
  userId: [{ required: true, message: "请输入好友的ID", trigger: "change" }],
});
const router = useRouter();
const { libp2pManager } = useLibp2p();
async function friendRequest() {
  if (!refPrivateChatForm.value) return;
  if (await refPrivateChatForm.value.validate()) {
    try {
      if (!isValidUserId(privateChatFormData.userId)) {
        throw new Error("userId is invalid");
      }
      const remotePeerIdString = getPeerIdFromUserId(
        privateChatFormData.userId
      );
      const remotePeerId = peerIdFromString(remotePeerIdString);
      // "/dns/webchatx.mayuan.work/tcp/10000/ws/p2p/12D3KooWFzsY7wUBHwbrz6m9nFfLCDwqLD4LS9JykKxSZ4zqG7Pg/p2p-circuit/p2p/"
      await libp2pManager.requestFriend(
        remotePeerId,
        privateChatFormData.validationMessage ||
          privateChatFormData.defaultValidationMessage
      );
      router.push({
        name: "PrivateChat",
        params: {
          user_id: privateChatFormData.userId,
        },
      });
    } catch (error) {
      console.error("Error submitting private chat form:", error);
    }
  }
}

// 创建channel 相关内容
const channels = [
  {
    name: "memeee",
    subscribers: 11,
    description: "Revélez votre talent",
  },
  // ... other channel data
];
const refCreateChannelForm = ref<FormInstance>();
const createChannelFormData = reactive({
  name: "",
  description: "",
});
const createChannelRules = reactive<FormRules<typeof createChannelFormData>>({
  name: [
    {
      required: true,
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error("请输入频道名称"));
        } else if (value.length > 12) {
          callback(new Error("频道名需要在12个字符以内"));
        } else {
          if (value.includes("@")) {
            callback(new Error("频道名不能包含@"));
          } else {
            callback();
          }
        }
      },
      trigger: "change",
    },
  ],
  description: [
    { required: false, message: "请输入频道描述", trigger: "change" },
  ],
});
async function createChannel() {
  if (!refCreateChannelForm.value) return;
  if (await refCreateChannelForm.value.validate()) {
    try {
      const channel = await libp2pManager.subscribeChannel(
        createChannelFormData.name,
        "",
        createChannelFormData.description
      );
      router.push({
        name: "Channel",
        params: {
          channel_id: channel.id,
        },
      });
    } catch (error) {
      console.error("Error submitting channel chat form:", error);
    }
  }
}

// 加入channel
const refJoinChannelForm = ref<FormInstance>();
const joinChannelFormData = reactive({
  uniqueId: "",
  description: "",
});
const joinChannelRules = reactive<FormRules<typeof joinChannelFormData>>({
  uniqueId: [
    {
      required: true,
      validator: (_rule: any, value: string, callback: any) => {
        if (value === "") {
          callback(new Error("请输入频道名称"));
        } else {
          const [channelName, channelId] = value.split("@");
          if (channelName.length > 12) {
            callback(new Error("频道名需要在12个字符以内"));
          } else if (channelName.includes("@")) {
            callback(new Error("频道名不能包含@"));
          } else {
            if (channelId.length === 52) {
              callback();
            } else {
              callback(new Error("唯一标识码不满足52位"));
            }
          }
        }
      },
      trigger: "change",
    },
  ],
  description: [{ required: false, message: "打个招呼吧", trigger: "change" }],
});
async function joinChannel() {
  if (!refJoinChannelForm.value) return;
  if (await refJoinChannelForm.value.validate()) {
    try {
      const [channelName, channelId] = joinChannelFormData.uniqueId.split("@");
      const channel = await libp2pManager.subscribeChannel(
        channelName,
        channelId,
        joinChannelFormData.description
      );
      router.push({
        name: "Channel",
        params: {
          channel_id: channel.id,
        },
      });
    } catch (error) {
      console.error("Error submitting channel chat form:", error);
    }
  }
}
</script>
