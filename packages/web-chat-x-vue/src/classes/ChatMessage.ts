import { generateAndSetIdentifier } from "@/utils";

export default class ChatMessage implements ChatMessageInfo {
  constructor(
    id: string,
    text: string,
    postUserId: string,
    answerUserId?: string,
    file?: File,
    channelId: string = ""
  ) {
    this.id = id;
    this.time = new Date();
    this.text = text;
    this.file = file;
    this.postUserId = postUserId;
    this.answerUserId = answerUserId;
    this.channelId = channelId;
  }
  id: string;
  text: string;
  time: Date;
  postUserId: string;
  file: File | undefined;
  answerUserId: string | undefined;
  channelId: string | undefined;
  static async create(
    text: string,
    postUserId: string,
    answerUserId?: string,
    file?: File,
    channelId: string = ""
  ) {
    const { id } = await generateAndSetIdentifier();
    return new ChatMessage(id, text, postUserId, answerUserId, file, channelId);
  }
}
