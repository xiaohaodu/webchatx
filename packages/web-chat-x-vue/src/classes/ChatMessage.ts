import useEncryption from "@/hooks/useEncryption";
export default class ChatMessage implements ChatMessageInfo {
  id: string;
  user: ChatUserInfo;
  channel: ChatChannelInfo;
  text: string;
  time: Date;
  constructor(
    id: string,
    user: ChatUserInfo,
    channel: ChatChannelInfo,
    text: string
  ) {
    this.id = id;
    this.time = new Date();
    this.text = text;
    this.user = user;
    this.channel = channel;
  }
  static async create(
    user: ChatUserInfo,
    channel: ChatChannelInfo,
    text: string
  ) {
    const { id } = await useEncryption();
    return new ChatMessage(id.value, user, channel, text);
  }
}
