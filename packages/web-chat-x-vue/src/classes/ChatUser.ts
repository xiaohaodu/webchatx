import useEncryption, { hashPassword } from "@/hooks/useEncryption";
import { PeerId } from "@libp2p/interface";
export default class ChatUser implements ChatUserInfo {
  id: string;
  peerId: PeerId;
  description: string;
  friends: ChatUserInfo[];
  channels: ChatChannelInfo[];
  unique: string = "currentUser";
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
  constructor(
    id: string,
    peerId: PeerId,
    name: string,
    password: string,
    hashedPassword: string,
    description: string
  ) {
    this.name = name;
    this.id = id;
    this.peerId = peerId;
    this.password = password;
    this.hashedPassword = hashedPassword;
    this.description = description;
    this.friends = [];
    this.channels = [];
    this.relayMultiaddrs = [];
    this.stunTurn = [];
    this.avatar = "";
    this.email = "";
    this.phone = "";
    this.location = "";
    this.role = "";
  }

  static async create(name: string, password: string, description: string) {
    const { id, peerId } = await useEncryption();
    return new ChatUser(
      id.value,
      peerId.value!,
      name,
      password,
      await hashPassword(password),
      description
    );
  }
}
