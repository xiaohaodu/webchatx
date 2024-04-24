import useEncryption, { hashPassword } from "@/hooks/useEncryption";
import { PeerId } from "@libp2p/interface";
export default class ChatChannel implements ChatChannelInfo {
  id: string;
  peerId: PeerId;
  description: string;
  friends: ChatUserInfo[];
  channels: ChatChannelInfo[];
  relayMultiaddrs: string[];
  unique: string = "currentUser";
  avatar: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  password: string;
  hashedPassword: string;
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
    this.relayMultiaddrs = [];
    this.channels = [];
    this.avatar = "";
    this.email = "";
    this.phone = "";
    this.location = "";
    this.role = "";
  }

  static async create(name: string, password: string, description: string) {
    const { id, peerId } = await useEncryption();
    return new ChatChannel(
      id.value,
      peerId.value!,
      name,
      password,
      await hashPassword(password),
      description
    );
  }
}
