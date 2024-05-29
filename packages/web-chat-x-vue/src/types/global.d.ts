import { PeerId } from "@libp2p/interface";
import { Multiaddr } from "@multiformats/multiaddr";

export {};

declare global {
  // 定义用户信息类型
  interface ChatUserInfo {
    unique: string; // 特殊字段，用于数据库标识
    userId: string; // 经过混淆码混淆以及添加crc32校验码后的peerId
    id: string; // 唯一id标识 peerId.toString()
    peerId: PeerId; // 节点的唯一标识，其中包含公钥和私钥的二进制数据
    description: string; // 描述
    friendIds: string[]; // 好友/订阅者 ID 群组
    channelIds: string[]; // 订阅 ID 群组
    messagesId: string; // messageAggregation ID 用户消息集合ID
    relayMultiaddrs: string[]; // multiaddr Libp2p中继地址
    stunTurn: string[]; // stun/turn服务器
    avatar: string; // 群聊/用户 头像
    name: string; // 名字
    email: string; // 联系邮件
    phone: string; // 联系电话
    location: string; // 地址
    role: string; // 身份
    isOnline: boolean; // 是否在线
  }

  interface ChatMessageAggregationInfo {
    id: string; //消息群组ID
    postUserId: string; // 消息发送者ID
    answerUserId: string | undefined; // 消息接收者ID
    channelId: string | undefined; // 所属群组ID
    messages: ChatMessageInfo[]; // 信息群组
  }

  // 定义频道信息类型 —————————— 频道就是特殊的用户，所以可以直接扩展用户信息
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

  // 添加朋友时发送和接收的数据类型
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

  // 向好友发送消息
  interface ProtocolFriendSendMessage extends ProtocolFriendAdd {}

  // 向好友发送文件
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

  // 向订阅的群组发送消息
  interface PubSubSendMessage extends ProtocolFriendSendMessage {}
  // 向订阅的群组发送文件
  interface PubSubSendFile extends ProtocolFriendSendFile {}
}
