import { generateAndSetIdentifier } from "@/utils";

export default class ChatMessageAggregation
  implements ChatMessageAggregationInfo
{
  constructor(
    id: string,
    postUserId: string,
    answerUserId: string = "",
    channelId: string = ""
  ) {
    this.id = id;
    this.channelId = channelId;
    this.postUserId = postUserId;
    this.answerUserId = answerUserId;
    this.messages = [];
  }
  id: string;
  channel: ChatChannelInfo | undefined;
  messages: ChatMessageInfo[];
  postUserId: string;
  answerUserId: string | undefined;
  channelId: string | undefined;
  static async create(
    postUserId: string,
    answerUserId: string = "",
    channelId: string = ""
  ) {
    const { id } = await generateAndSetIdentifier();
    return new ChatMessageAggregation(id, postUserId, answerUserId, channelId);
  }
}
