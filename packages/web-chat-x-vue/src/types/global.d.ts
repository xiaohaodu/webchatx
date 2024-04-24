import { PeerId } from "@libp2p/interface";
import { Multiaddr } from "@multiformats/multiaddr";

export {};

declare global {
  // 定义用户信息类型
  interface ChatUserInfo {
    unique: string;

    id: string; // 唯一id标识
    peerId: PeerId;
    description: string; // 描述
    friends: ChatUserInfo[]; // 好友/订阅者
    channels: ChatChannelInfo[]; //订阅
    relayMultiaddrs: string[]; // multiaddr
    avatar: string; // 群聊/用户 头像
    name: string; // 名字
    email: string; // 联系邮件
    phone: string; // 联系电话
    location: string; // 地址
    role: string; // 身份
    password: string;
    hashedPassword: string; // 哈希加密后的密码
  }

  // 定义频道信息类型 ——————————  扩展用户信息
  interface ChatChannelInfo extends ChatUserInfo {}

  // 定义消息类型
  interface ChatMessageInfo {
    id: string; // 消息ID
    user: ChatUserInfo; // 发送者信息
    channel: ChatChannelInfo; // 所需群组
    text: string; // 消息正文
    time: Date; // 消息时间，存储为时间戳，显示时格式化为字符串（例如ISO 8601标准）
  }
}
