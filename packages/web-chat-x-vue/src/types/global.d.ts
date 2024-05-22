import { PeerId } from "@libp2p/interface";
import { Multiaddr } from "@multiformats/multiaddr";

export {};

declare global {
  // 定义用户信息类型
  interface ChatUserInfo {
    unique: string;
    userId: string;
    id: string; // 唯一id标识
    peerId: PeerId;
    description: string; // 描述
    friendIds: string[]; // 好友/订阅者 ID 群组
    channelIds: string[]; // 订阅 ID 群组
    messagesId: string; //message 群组 ID
    relayMultiaddrs: string[]; // multiaddr
    stunTurn: string[];
    avatar: string; // 群聊/用户 头像
    name: string; // 名字
    email: string; // 联系邮件
    phone: string; // 联系电话
    location: string; // 地址
    role: string; // 身份
    isOnline: boolean;
  }

  interface ChatMessageAggregationInfo {
    id: string; //消息群组ID
    postUserId: string; //
    answerUserId: string | undefined; //
    channelId: string | undefined; //所属群组ID
    messages: ChatMessageInfo[]; //信息群组
  }

  // 定义频道信息类型 ——————————  扩展用户信息
  interface ChatChannelInfo extends ChatUserInfo {}

  // 定义消息类型
  interface ChatMessageInfo {
    id: string; // 消息ID
    postUserId: string; // 发送者ID
    answerUserId: string | undefined; //接收者ID
    channelId: string | undefined; // 所需群组
    text: string; // 消息正文
    file: File | undefined; //传送的文件
    time: Date; // 消息时间，存储为时间戳，显示时格式化为字符串（例如ISO 8601标准）
  }

  interface ProtocolFriendAdd {
    message: string;
    user: {
      userId: string;
      peerId: string;
      name: string;
      description: string;
      location: string;
      role: string;
      email: string;
      phone: string;
      avatar: string;
    };
  }
  interface ProtocolFriendSendMessage extends ProtocolFriendAdd {}
  interface ProtocolFriendSendFile {
    file: {
      name: string;
      type: string;
      binaryString: string;
    };
    user: {
      userId: string;
      peerId: string;
      name: string;
      description: string;
      location: string;
      role: string;
      email: string;
      phone: string;
      avatar: string;
    };
  }

  interface PubSubSendMessage extends ProtocolFriendSendMessage {}
  interface PubSubSendFile extends ProtocolFriendSendFile {}
}
