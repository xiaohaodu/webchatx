import {
  generateAndSetIdentifier,
  getPeerIdFromUserId,
  hashPassword,
} from "@/utils";
import { PeerId } from "@libp2p/interface";
import { peerIdFromString } from "@libp2p/peer-id";
export default class ChatChannel implements ChatChannelInfo {
  constructor(
    id: string,
    userId: string,
    peerId: PeerId,
    name: string,
    messagesId: string,
    friendIds: string[],
    channelIds: string[],
    relayMultiaddrs: string[],
    password: string,
    hashedPassword: string,
    description: string,
    unique?: string
  ) {
    this.name = name;
    this.id = id;
    this.userId = userId;
    this.peerId = peerId;
    this.messagesId = messagesId;
    this.password = password;
    this.hashedPassword = hashedPassword;
    this.description = description;
    this.friendIds = [...friendIds];
    this.channelIds = [...channelIds];
    this.relayMultiaddrs = [...relayMultiaddrs];
    this.stunTurn = [];
    this.avatar = "";
    this.email = "";
    this.phone = "";
    this.location = "";
    this.role = "";
    this.unique = unique || "chatChannel";
    this.isOnline = false;
  }
  isOnline: boolean;
  id: string;
  userId: string;
  peerId: PeerId;
  description: string;
  unique: string;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  password: string;
  hashedPassword: string;
  relayMultiaddrs: string[];
  stunTurn: string[];
  friendIds: string[];
  channelIds: string[];
  messagesId: string;
  static async create(
    name: string,
    password: string,
    description: string,
    friendIds: string[],
    channelIds: string[],
    relayMultiaddrs: string[],
    messagesId: string,
    unique?: string,
    userId?: string,
    peerIdString?: string
  ) {
    let chatChannel: ChatChannel;
    if (userId) {
      const peerId = peerIdFromString(getPeerIdFromUserId(userId));
      chatChannel = new ChatChannel(
        peerId.toString(),
        userId,
        peerId,
        name,
        messagesId,
        friendIds,
        channelIds,
        relayMultiaddrs,
        password,
        await hashPassword(password),
        description,
        unique
      );
    } else {
      const { id, peerId } = await generateAndSetIdentifier(peerIdString, true);
      chatChannel = new ChatChannel(
        peerId.toString(),
        id,
        peerId,
        name,
        messagesId,
        friendIds,
        channelIds,
        relayMultiaddrs,
        password,
        await hashPassword(password),
        description,
        unique
      );
    }
    return chatChannel;
  }
}
