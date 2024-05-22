import { Libp2p, createLibp2p } from "libp2p";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { identify } from "@libp2p/identify";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { echo } from "@libp2p/echo";
import * as filters from "@libp2p/websockets/filters";
import {
  PeerId,
  PeerStore,
  PubSub,
  SignedMessage,
  Stream,
} from "@libp2p/interface";
import { Multiaddr, multiaddr } from "@multiformats/multiaddr";
import { GossipsubEvents, gossipsub } from "@chainsafe/libp2p-gossipsub";
import ChatUser from "./ChatUser";
// import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { pipe } from "it-pipe";
import { DatabaseManager } from "./DatabaseManager";
import ChatMessageAggregation from "./ChatMessageAggregation";
import ChatMessage from "./ChatMessage";
import { cloneDeep } from "lodash-es";
import { peerIdFromPeerId, peerIdFromString } from "@libp2p/peer-id";
import { PeerManager } from "./PeerManager";
import ChatChannel from "./ChatChannel";
import { base64ToFile, fileToBase64 } from "@/utils";
const topics = [
  `webChatX._peer-discovery._p2p._pubsub`, // It's recommended but not required to extend the global space
  // "_peer-discovery._p2p._pubsub", // Include if you want to participate in the global space
];
export class Libp2pManager {
  private libp2p: Libp2p | undefined;
  private peerId: PeerId | undefined;
  private peerStore: PeerStore | undefined;
  private chatUser: Ref<ChatUser> | undefined;
  private friends: Ref<ChatUser[]> | undefined;
  private channels: Ref<ChatChannel[]> | undefined;
  private subscribers: Ref<ChatUser[]> | undefined;
  private relayMultiaddr: Multiaddr = multiaddr(
    "/dns/webchatx.mayuan.work/tcp/9000/ws/p2p/12D3KooWFzsY7wUBHwbrz6m9nFfLCDwqLD4LS9JykKxSZ4zqG7Pg"
  );
  public databaseManager: DatabaseManager | undefined;
  public peerManager: PeerManager | undefined;
  private running: boolean = false;
  private textDecoder = new TextDecoder();
  private textEncoder = new TextEncoder();

  getChannels() {
    return this.channels;
  }
  getStatus(): boolean {
    return this.running;
  }
  getRelayMultiaddr(): Multiaddr {
    return this.relayMultiaddr;
  }
  setRelayMultiaddr(relayMultiaddr: Multiaddr): Multiaddr {
    this.relayMultiaddr = relayMultiaddr;
    return this.relayMultiaddr;
  }
  // Getter for libp2p
  getLibp2p(): Libp2p | undefined {
    return this.libp2p;
  }

  async getMessageAggregation(
    id: string,
    postUserId: string,
    answerUserId: string,
    channelId: string = ""
  ) {
    return (await this.databaseManager?.getMessageAggregation(
      id,
      postUserId,
      answerUserId,
      channelId
    ))!;
  }

  async getPublicDbUsers() {
    return (await this.databaseManager?.getPublicDbUsers())!;
  }

  async getFriend(id: string) {
    return this.friends?.value.find((value) => {
      return value.id == id;
    });
  }

  getSubscriber(id: string) {
    return this.subscribers?.value.find((value) => {
      return (value.id = id);
    });
  }

  getChannel(id: string) {
    return this.channels?.value.find((value: ChatChannel) => {
      return value.id == id;
    });
  }

  getFriends() {
    return this.friends;
  }

  getSubscribers() {
    return this.subscribers;
  }

  getPeerStore(): PeerStore | undefined {
    return this.peerStore;
  }
  getPeerId(): PeerId | undefined {
    return this.peerId;
  }

  async setChatUser(chatUser: ChatUser) {
    this.chatUser = ref(chatUser);
    this.friends = ref(
      (await this.databaseManager?.activatedUserDb.friends.toArray())!
    );
    this.channels = ref(
      (await this.databaseManager?.activatedUserDb.channels.toArray())!
    );
    this.subscribers = ref(
      (await this.databaseManager?.activatedUserDb.subscribers.toArray())!
    );
  }

  async addFriend(friend: ChatUser) {
    const friendIds = this.chatUser?.value.friendIds!;
    if (!friendIds.includes(friend.id)) {
      friendIds.push(friend.id);
      this.friends?.value.push(friend);
      await this.databaseManager?.putFriend(
        cloneDeep(friend),
        cloneDeep(this.chatUser?.value!)
      );
      friend.isOnline = true;
    }
  }

  async addChannel(channel: ChatChannel) {
    const channelIds = this.chatUser?.value.channelIds!;
    if (!channelIds.includes(channel.id)) {
      channelIds.push(channel.id);
      this.channels?.value.push(channel);
      await this.databaseManager?.putChannel(
        channel,
        cloneDeep(this.chatUser?.value!)
      );
    }
  }
  /**
   *
   * @param linkOrSend boolean @description true 是为link false 为send
   * @param channel ChatChannel
   * @param subscriber ChatUser
   */
  async addChannelSubscriber(
    linkOrSend: boolean,
    channel: ChatChannel,
    subscriber: ChatUser
  ) {
    if (linkOrSend) {
      const have = channel.friendIds.includes(subscriber.id);
      if (!have) {
        channel.friendIds.push(subscriber.id);
        const subscriberHave = await this.databaseManager?.getSubscriber(
          subscriber.id
        );
        if (!subscriberHave) {
          await this.databaseManager?.putSubscriber(
            cloneDeep(channel),
            cloneDeep(subscriber)
          );
        }
      }
    } else {
      await this.databaseManager?.putSubscriber(
        cloneDeep(channel),
        cloneDeep(subscriber)
      );
    }
  }

  getChatUser() {
    return this.chatUser!;
  }

  async createNewUser(user: ChatUser) {
    await this.databaseManager?.createNewUser(user);
  }

  async createActivateUserDb(user: ChatUser, peerId: string) {
    await this.databaseManager?.createActivateUserDb(user, peerId);
  }

  constructor() {}
  async createLibp2pNode(peerId?: PeerId): Promise<void> {
    this.libp2p = await createLibp2p({
      addresses: {
        listen: ["/webrtc"],
      },
      transports: [
        webSockets({ filter: filters.all }),
        webRTC({
          rtcConfiguration: {
            iceServers: [
              {
                urls: "stun:stun.l.google.com:19302",
              },
              {
                urls: "stun:global.stun.twilio.com:3478",
              },
              {
                urls: "turn:webchatx.stun.mayuan.work:3478",
                username: "dxh",
                credential: "187139",
              },
            ],
          },
        }),
        circuitRelayTransport({
          discoverRelays: 1,
        }),
      ],
      connectionEncryption: [noise()],
      streamMuxers: [yamux()],
      peerDiscovery: [
        // pubsubPeerDiscovery({
        //   interval: 10000,
        //   topics: topics, // defaults to ['_peer-discovery._p2p._pubsub']
        //   listenOnly: false,
        // }),
      ],
      services: {
        identify: identify(),
        echo: echo(),
        pubsub: gossipsub({
          emitSelf: false,
          fallbackToFloodsub: true,
          floodPublish: true,
          doPX: true,
        }),
      },
      peerId,
    });
    this.peerId = this.libp2p.peerId;
    this.peerStore = this.libp2p.peerStore;
    await this.libp2pHandleExpand();
    this.running = true;
  }

  async startLibp2pNode(relayMultiaddr?: Multiaddr): Promise<void> {
    relayMultiaddr && this.setRelayMultiaddr(relayMultiaddr);
    return new Promise(async (resolve, reject) => {
      let timeInterval: NodeJS.Timeout;
      const timeIntervalStart = () => {
        timeInterval = setTimeout(() => {
          const multiaddrs = this.libp2p!.getMultiaddrs();
          if (multiaddrs.length) {
            clearInterval(timeInterval);
            resolve();
          } else {
            timeInterval = setTimeout(timeIntervalStart, 1000);
          }
        }, 1500);
      };

      if (!this.libp2p) {
        return reject(
          new Error("Libp2p node not created yet. Call createLibp2pNode first.")
        );
      }
      // this.libp2p.addEventListener("connection:open", (connection) => {
      //   console.log("connection:open", connection.detail);
      // });
      // this.libp2p.addEventListener("connection:close", (connection) => {
      //   console.log("connection:open", connection.detail);
      // });
      // this.libp2p.addEventListener("connection:prune", (connection) => {
      //   console.log("connection:prune", connection.detail);
      // });
      this.libp2p.addEventListener("peer:connect", (peerId) => {
        console.log("peer:connect ", peerId.detail);
        for (const index in this.friends?.value!) {
          if (this.friends?.value[index].id! == peerId.detail.toString()) {
            this.friends!.value[index].isOnline = true;
            return;
          }
        }
      });
      this.libp2p.addEventListener("peer:disconnect", (peerId) => {
        console.log("peer:disconnect ", peerId.detail);
        for (const index in this.friends?.value!) {
          if (this.friends?.value[index].id! == peerId.detail.toString()) {
            this.friends!.value[index].isOnline = false;
            return;
          }
        }
      });
      // this.libp2p.addEventListener("peer:discovery", (peerIdInfo) => {
      //   console.log("peer:discovery ", peerIdInfo.detail);
      // });
      // this.libp2p.addEventListener("peer:identify", (identifyResult) => {
      //   console.log("peer:identify ", identifyResult.detail);
      // });
      // this.libp2p.addEventListener("peer:update", (peerUpdate) => {
      //   console.log("peer:update ", peerUpdate.detail);
      // });
      // this.libp2p.addEventListener("self:peer:update", (peerUpdate) => {
      //   console.log("self:peer:update ", peerUpdate.detail);
      //   console.log("protocols", this.libp2p?.getProtocols());
      //   console.log("multiaddrs", this.libp2p?.getMultiaddrs());
      //   console.log("dialQueue", this.libp2p?.getDialQueue());
      //   console.log("connections", this.libp2p?.getConnections());
      //   console.log("peers", this.libp2p?.getPeers());
      // });
      this.libp2p.addEventListener("start", () => {
        console.log("start");
        // console.log("protocols", this.libp2p?.getProtocols());
        // console.log("multiaddrs", this.libp2p?.getMultiaddrs());
        // console.log("dialQueue", this.libp2p?.getDialQueue());
        // console.log("connections", this.libp2p?.getConnections());
        // console.log("peers", this.libp2p?.getPeers());
        this.running = true;
      });
      this.libp2p.addEventListener("stop", () => {
        console.log("stop");
        this.running = false;
      });
      // this.libp2p.addEventListener("transport:close", (listener) => {
      //   console.log("transport:close", listener.detail);
      // });
      // this.libp2p.addEventListener("transport:listening", (listener) => {
      //   console.log("transport:listening", listener.detail);
      // });
      try {
        await this.libp2p.dialProtocol(
          this.relayMultiaddr,
          this.libp2p.getProtocols(),
          {
            signal: AbortSignal.timeout(5000),
          }
        );
        this.connectFriends();
        this.subscribe();
        timeIntervalStart();
      } catch (error) {
        reject(error);
      }
    });
  }

  async subscribeChannel(
    channelName: string,
    channelId: string,
    channelDescription: string
  ) {
    const channel = await ChatChannel.create(
      channelName,
      channelDescription,
      [],
      [],
      [],
      "",
      "",
      channelId
    );
    (this.libp2p?.services.pubsub as PubSub<GossipsubEvents>).subscribe(
      `${channelName}@${channel.id}`
    );
    const [messages] = await Promise.all([
      ChatMessageAggregation.create(
        this.chatUser?.value.id!,
        channel.id,
        channel.id
      ),
    ]);
    channel.messagesId = messages.id;
    await Promise.all([
      this.addChannel(channel),
      this.databaseManager?.activatedUserDb.messages.put(messages),
    ]);
    return channel;
  }

  subscribe = () => {
    const fallbackCall = async (
      channel: ChatChannel,
      subscriber: PeerId
    ): Promise<void> => {
      const newSubscriber = await ChatUser.create(
        "",
        "",
        [],
        [],
        [],
        "",
        "",
        subscriber.toString()
      );
      await this.addChannelSubscriber(true, channel, newSubscriber);
    };
    const promiseAllArray: Promise<void>[] = [];
    if (this.channels?.value) {
      for (const channel of this.channels.value) {
        const subscribers = (
          this.libp2p?.services.pubsub as PubSub<GossipsubEvents>
        ).getSubscribers(`${channel.name}@${channel.id}`);
        const subscriberIds = subscribers.map((v) => v.toString());
        channel.friendIds = channel.friendIds.filter((friendId) => {
          return subscriberIds.includes(friendId);
        });
        for (const subscriber of subscribers) {
          promiseAllArray.push(fallbackCall(channel, subscriber));
        }
        (this.libp2p!.services.pubsub as PubSub<GossipsubEvents>).subscribe(
          `${channel.name}@${channel.id}`
        );
      }
    }
    Promise.all(promiseAllArray).then(() => {
      new Promise<void>((resolve) => {
        setTimeout(() => {
          this.subscribe();
          resolve();
        }, 2000);
      });
    });
  };

  async publishSubscribeMessage(chatChannel: ChatChannel, message: string) {
    await (this.libp2p!.services.pubsub as PubSub<GossipsubEvents>).publish(
      `${chatChannel.name}@${chatChannel.id}`,
      new TextEncoder().encode(
        JSON.stringify({
          message,
          user: {
            userId: this.chatUser?.value.userId,
            peerId: this.chatUser?.value.id,
            name: this.chatUser?.value.name,
            description: this.chatUser?.value.description,
            location: this.chatUser?.value.location,
            role: this.chatUser?.value.role,
            email: this.chatUser?.value.email,
            phone: this.chatUser?.value.phone,
            avatar: this.chatUser?.value.avatar,
          },
        })
      )
    );
    const messages = (await this.databaseManager?.putMessage(
      true,
      this.chatUser?.value.id!,
      chatChannel.id,
      message,
      chatChannel.id
    ))!;
    return messages;
  }

  connectFriends() {
    const fallbackCall = async (
      friendPeerId: PeerId,
      friendPeerIdString: string
    ) => {
      try {
        await this.libp2p?.dialProtocol(friendPeerId, "/echo/1.0.0");
        console.log("connect success", friendPeerIdString);
      } catch (_e) {
        console.log("connect ", friendPeerIdString, " failed", _e);
      }
    };
    const promiseAllArray: Promise<void>[] = [];
    this.friends?.value.forEach((friend) => {
      const friendPeerIdString = friend.id;
      const friendPeerId = peerIdFromString(friendPeerIdString);
      promiseAllArray.push(fallbackCall(friendPeerId, friendPeerIdString));
    });
    Promise.all(promiseAllArray).then(() => {
      new Promise<void>((resolve) => {
        setTimeout(() => {
          this.connectFriends();
          resolve();
        }, 1000);
      });
    });
  }

  async libp2pHandleExpand() {
    if (this.libp2p) {
      // 读取数据示例
      await this.libp2p.handle("/friends/add", async ({ stream }) => {
        let remoteMessageString = "";
        for await (const buf of stream.source) {
          remoteMessageString += this.textDecoder.decode(buf.subarray());
        }
        const remoteMessageObject = JSON.parse(
          remoteMessageString
        ) as ProtocolFriendAdd;
        // 写入数据示例
        await stream.sink([
          Uint8Array.from(
            this.textEncoder.encode(
              JSON.stringify({
                message: `hello! 欢迎你与我通信，我是${this.chatUser?.value.name}`,
                user: {
                  userId: this.chatUser?.value.userId,
                  peerId: this.chatUser?.value.id,
                  name: this.chatUser?.value.name,
                  description: this.chatUser?.value.description,
                  location: this.chatUser?.value.location,
                  role: this.chatUser?.value.role,
                  email: this.chatUser?.value.email,
                  phone: this.chatUser?.value.phone,
                  avatar: this.chatUser?.value.avatar,
                },
              })
            )
          ),
        ]);
        ElNotification({
          title: "新朋友",
          message: "你有新的朋友聊天请求",
          duration: 4500,
        });
        const [messageAggregation, messageMe, messageYou] = await Promise.all([
          ChatMessageAggregation.create(
            this.chatUser?.value.id!,
            remoteMessageObject.user.peerId
          ),
          ChatMessage.create(
            `hello! 欢迎你与我通信，我是${this.chatUser?.value.name}`,
            this.chatUser?.value.id!,
            remoteMessageObject.user.peerId
          ),
          ChatMessage.create(
            remoteMessageObject.message,
            remoteMessageObject.user.peerId,
            this.chatUser?.value.id
          ),
        ]);
        const friend = await ChatUser.create(
          remoteMessageObject.user.name,
          remoteMessageObject.user.description,
          [],
          [],
          [],
          messageAggregation.id,
          "friend" + remoteMessageObject.user.peerId,
          remoteMessageObject.user.userId
        );
        friend.avatar = remoteMessageObject.user.avatar;
        friend.location = remoteMessageObject.user.location;
        friend.role = remoteMessageObject.user.role;
        friend.email = remoteMessageObject.user.email;
        friend.phone = remoteMessageObject.user.phone;
        messageAggregation.messages.push(messageYou, messageMe);
        await Promise.all([
          this.addFriend(friend),
          this.databaseManager?.putMessageAggregation(messageAggregation),
        ]);
        console.log("add friend", remoteMessageObject, friend);

        // 记得正确关闭或处理流的结束
        await stream.close();
      });
      await this.libp2p.handle("/friend/sendMessage", async ({ stream }) => {
        let remoteMessageString = "";
        for await (const buf of stream.source) {
          remoteMessageString += this.textDecoder.decode(buf.subarray());
        }
        const remoteMessageObject = JSON.parse(
          remoteMessageString
        ) as ProtocolFriendSendMessage;
        await this.databaseManager?.putMessage(
          false,
          this.chatUser?.value.id!,
          remoteMessageObject.user.peerId,
          remoteMessageObject.message
        );
        await stream.close();
      });
      await this.libp2p.handle("/friend/sendFile", async ({ stream }) => {
        let remoteMessageString = "";
        for await (const buf of stream.source) {
          remoteMessageString += this.textDecoder.decode(buf.subarray());
        }
        const remoteMessageObject = JSON.parse(
          remoteMessageString
        ) as ProtocolFriendSendFile;
        console.log(remoteMessageObject);
        const file = base64ToFile(
          remoteMessageObject.file.name,
          remoteMessageObject.file.type,
          remoteMessageObject.file.binaryString
        );
        console.log(file);
        await this.databaseManager?.putMessage(
          false,
          this.chatUser?.value.id!,
          remoteMessageObject.user.peerId,
          "",
          "",
          file
        );
        await stream.close();
      });
      (
        this.libp2p!.services.pubsub as PubSub<GossipsubEvents>
      ).addEventListener("message", async (event_) => {
        const topic = event_.detail.topic;
        if (topics.includes(topic)) {
          console.log(topic, event_.detail);
        } else {
          const signedMessage = event_.detail as SignedMessage;

          for (const channel of this.channels?.value!) {
            console.log(signedMessage, channel);
            if (`${channel.name}@${channel.id}` === topic) {
              const pubsubSendMessage = JSON.parse(
                this.textDecoder.decode(signedMessage.data)
              ) as PubSubSendMessage;
              console.log(topic, pubsubSendMessage, signedMessage);
              const channelSubscribe = await ChatUser.create(
                pubsubSendMessage.user.name,
                pubsubSendMessage.user.description,
                [],
                [],
                [],
                "",
                "",
                pubsubSendMessage.user.userId
              );
              channelSubscribe.avatar = pubsubSendMessage.user.avatar;
              channelSubscribe.location = pubsubSendMessage.user.location;
              channelSubscribe.role = pubsubSendMessage.user.role;
              channelSubscribe.email = pubsubSendMessage.user.email;
              channelSubscribe.phone = pubsubSendMessage.user.phone;
              this.addChannelSubscriber(false, channel, channelSubscribe);
              await this.databaseManager?.putMessage(
                false,
                this.chatUser?.value.id!,
                pubsubSendMessage.user.peerId,
                pubsubSendMessage.message,
                channel.id
              );
              return;
            }
          }
        }
      });
    } else {
      console.log("libp2p is undefined or null");
    }
  }

  async sendFile(friend: ChatUser, file: File) {
    return new Promise(async (resolve) => {
      const fileString = await fileToBase64(file);
      const timeInterval = ref<NodeJS.Timeout>();
      const timeIntervalStart = async () => {
        try {
          const peerId = peerIdFromPeerId(friend.peerId);
          const stream = await this.libp2p?.dialProtocol(
            peerId,
            "/friend/sendFile"
          )!;
          await pipe(
            [
              new TextEncoder().encode(
                JSON.stringify({
                  file: {
                    name: file.name,
                    type: file.type,
                    binaryString: fileString,
                  },
                  user: {
                    userId: this.chatUser?.value.userId,
                    peerId: this.chatUser?.value.id,
                    name: this.chatUser?.value.name,
                    description: this.chatUser?.value.description,
                    location: this.chatUser?.value.location,
                    role: this.chatUser?.value.role,
                    email: this.chatUser?.value.email,
                    phone: this.chatUser?.value.phone,
                    avatar: this.chatUser?.value.avatar,
                  },
                })
              ),
            ],
            stream,
            async (_source) => {
              // for await (const buf of _source) {
              //   this.textDecoder.decode(buf.subarray());
              // }
            }
          );
          const messages = (await this.databaseManager?.putMessage(
            true,
            this.chatUser?.value.id!,
            friend.id,
            "",
            "",
            file
          ))!;
          clearTimeout(timeInterval.value);
          resolve(messages);
        } catch (error) {
          console.log("sendFile", error);
          timeInterval.value = setTimeout(timeIntervalStart, 1000);
        }
      };
      timeIntervalStart();
    });
  }

  async sendMessage(
    friend: ChatUser,
    message: string
  ): Promise<ChatMessageAggregationInfo> {
    return new Promise(async (resolve, _) => {
      const timeInterval = ref<NodeJS.Timeout>();
      const timeIntervalStart = async () => {
        try {
          const peerId = peerIdFromPeerId(friend.peerId);
          const stream = await this.libp2p?.dialProtocol(
            peerId,
            "/friend/sendMessage"
          )!;
          await pipe(
            [
              new TextEncoder().encode(
                JSON.stringify({
                  message,
                  user: {
                    userId: this.chatUser?.value.userId,
                    peerId: this.chatUser?.value.id,
                    name: this.chatUser?.value.name,
                    description: this.chatUser?.value.description,
                    location: this.chatUser?.value.location,
                    role: this.chatUser?.value.role,
                    email: this.chatUser?.value.email,
                    phone: this.chatUser?.value.phone,
                    avatar: this.chatUser?.value.avatar,
                  },
                })
              ),
            ],
            stream,
            async (_source) => {
              // for await (const buf of _source) {
              //   this.textDecoder.decode(buf.subarray());
              // }
            }
          );
          const messages = (await this.databaseManager?.putMessage(
            true,
            this.chatUser?.value.id!,
            friend.id,
            message
          ))!;
          clearTimeout(timeInterval.value);
          resolve(messages);
        } catch (error) {
          console.log("sendMessage", error);
          timeInterval.value = setTimeout(timeIntervalStart, 1000);
        }
      };
      timeIntervalStart();
    });
  }

  async requestFriend(
    remotePeer: PeerId | Multiaddr,
    validationMessage: string
  ): Promise<Stream> {
    return new Promise(async (resolve, _) => {
      const timeInterval = ref<NodeJS.Timeout>();
      const timeIntervalStart = (remotePeer: PeerId | Multiaddr) => {
        timeInterval.value = setInterval(async () => {
          try {
            const stream = await this.libp2p?.dialProtocol(
              remotePeer,
              "/friends/add"
            )!;
            let responseString = "";
            await pipe(
              [
                new TextEncoder().encode(
                  JSON.stringify({
                    message: validationMessage,
                    user: {
                      userId: this.chatUser?.value.userId,
                      peerId: this.chatUser?.value.id,
                      name: this.chatUser?.value.name,
                      description: this.chatUser?.value.description,
                      location: this.chatUser?.value.location,
                      role: this.chatUser?.value.role,
                      email: this.chatUser?.value.email,
                      phone: this.chatUser?.value.phone,
                      avatar: this.chatUser?.value.avatar,
                    },
                  })
                ),
              ],
              stream,
              async (source) => {
                for await (const buf of source) {
                  responseString = this.textDecoder.decode(buf.subarray());
                }
              }
            );
            const responseObject = JSON.parse(
              responseString
            ) as ProtocolFriendAdd;
            const [messages, messageMe, messageYou] = await Promise.all([
              ChatMessageAggregation.create(
                this.chatUser?.value.id!,
                responseObject.user.peerId
              ),
              ChatMessage.create(
                validationMessage,
                this.chatUser?.value.id!,
                responseObject.user.peerId
              ),
              ChatMessage.create(
                responseObject.message,
                responseObject.user.peerId,
                this.chatUser?.value.id
              ),
            ]);
            messages.messages.push(messageMe, messageYou);
            const friend = await ChatUser.create(
              responseObject.user.name,
              "",
              [],
              [],
              [],
              messages.id,
              "friend" + responseObject.user.peerId,
              responseObject.user.userId
            );
            await Promise.all([
              this.addFriend(friend),
              this.databaseManager?.activatedUserDb.messages.put(messages),
            ]);
            ElMessageBox.close();
            AlertLoading.value = false;
            clearInterval(timeInterval.value);
            resolve(stream);
          } catch (error) {
            console.log("addFriend", error);
          }
        }, 1500);
      };

      const AlertMessage = ref("寻找朋友节点中");
      const AlertLoading = ref(true);
      ElMessageBox({
        title: "添加好友",
        message: () =>
          h(
            ElButton,
            {
              id: "message",
              loading: AlertLoading.value,
              type: "primary",
            },
            () => AlertMessage.value
          ),
        center: true,
        showConfirmButton: false,
        distinguishCancelAndClose: true,
        closeOnClickModal: false,
        closeOnPressEscape: false,
      })
        .then(() => {
          clearInterval(timeInterval.value);
        })
        .catch(() => {
          clearInterval(timeInterval.value);
        });
      timeIntervalStart(remotePeer);
    });
  }
}
