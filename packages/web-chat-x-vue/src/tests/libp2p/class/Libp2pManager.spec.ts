import { Libp2p, createLibp2p } from "libp2p";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { identify } from "@libp2p/identify";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { echo } from "@libp2p/echo";
import * as filters from "@libp2p/websockets/filters";
import { KadDHT, kadDHT } from "@libp2p/kad-dht";
import { PeerId, PeerStore } from "@libp2p/interface";
import { Multiaddr } from "@multiformats/multiaddr";
import { mdns } from "@libp2p/mdns";
import { GossipSub, gossipsub } from "@chainsafe/libp2p-gossipsub";
import { peerIdFromString } from "@libp2p/peer-id";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import ChatChannel from "../../../classes/ChatChannel";
import ChatUser from "../../../classes/ChatUser";
export class Libp2pManager {
  private libp2p: Libp2p | undefined;
  private peerId: PeerId | undefined;
  private peerStore: PeerStore | undefined;
  private friends: ChatUser[] | undefined;
  private channels: ChatChannel[] | undefined;

  // Getter for libp2p
  getLibp2p(): Libp2p | undefined {
    return this.libp2p;
  }

  getPeerStore(): PeerStore | undefined {
    return this.peerStore;
  }
  getPeerId(): PeerId | undefined {
    return this.peerId;
  }

  // Getter for friends
  getFriends(): ChatUser[] | undefined {
    return this.friends;
  }

  // Setter for friends
  setFriends(friends: ChatUser[] | undefined): void {
    this.friends = friends;
  }

  // Getter for channels
  getChannels(): ChatChannel[] | undefined {
    return this.channels;
  }

  // Setter for channels
  setChannels(channels: ChatChannel[] | undefined): void {
    this.channels = channels;
  }

  constructor() {}
  async createLibp2pNode(peerId?: PeerId): Promise<void> {
    this.libp2p = await createLibp2p({
      addresses: {
        listen: ["/webrtc"],
      },
      transports: [
        webSockets({ filter: filters.all }),
        webRTC(),
        circuitRelayTransport({
          discoverRelays: 1,
        }),
      ],
      connectionEncryption: [noise()],
      streamMuxers: [yamux()],
      peerDiscovery: [mdns(), pubsubPeerDiscovery()],
      services: {
        identify: identify(),
        echo: echo(),
        dht: kadDHT({
          clientMode: false,
          kBucketSize: 20,
        }),
        pubsub: gossipsub({
          emitSelf: false,
          fallbackToFloodsub: true,
          floodPublish: true,
          doPX: true,
        }),
      },
      peerId,
    });
    (this.libp2p.services.dht as KadDHT).setMode("server");
    this.peerId = this.libp2p.peerId;
    this.peerStore = this.libp2p.peerStore;
  }

  async startLibp2pNode(
    relayMultiaddrs?: Multiaddr[] | Multiaddr,
    relayRemotePeerId?: PeerId
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const timeIntervalStart = () => {
        const timeInterval = setInterval(() => {
          const multiaddrs = this.libp2p!.getMultiaddrs();
          if (multiaddrs.length) {
            console.log("libp2p start ");
            multiaddrs.forEach((multiaddr) => {
              console.log("multiaddr -> ", multiaddr.toString());
            });
            console.log("libp2p peerId ", this.libp2p!.peerId.toString());
            clearInterval(timeInterval);
            resolve();
          }
        }, 1000);
      };

      if (!this.libp2p) {
        reject(
          new Error("Libp2p node not created yet. Call createLibp2pNode first.")
        );
      }
      // this.libp2p.addEventListener("peer:connect", (peerId) => {
      //   console.log("peer:connect ", peerId.detail.toString());
      //   // this.libp2p?.peerStore.forEach((peer) => {
      //   //   console.log(peer);
      //   // });
      //   // console.log("libp2p:connect");
      //   // this.libp2p?.getConnections().forEach((connect) => {
      //   //   console.log("connect -> ", connect);
      //   // });
      // });
      // this.libp2p.addEventListener("peer:discovery", (peerIdInfo) => {
      //   console.log("peer:discovery ", peerIdInfo.detail.id);
      // });
      // this.libp2p.addEventListener("peer:disconnect", (peerId) => {
      //   console.log("peer:disconnect ", peerId.detail.toString());
      // });
      await this.libp2p!.start();
      if (relayMultiaddrs) {
        try {
          await this.libp2p!.dialProtocol(
            relayMultiaddrs,
            this.libp2p!.getProtocols(),
            {
              signal: AbortSignal.timeout(5000),
            }
          );
          timeIntervalStart();
        } catch (error) {
          reject(new Error("FindPeer Failed"));
        }
      } else if (relayRemotePeerId) {
        const timeInterval = setInterval(async () => {
          try {
            const remotePeerIdInfo = await this.libp2p!.peerRouting.findPeer(
              relayRemotePeerId
            );
            await this.libp2p?.dialProtocol(
              remotePeerIdInfo.id,
              this.libp2p.getProtocols(),
              { signal: AbortSignal.timeout(5000) }
            );
            console.log("findPeer relayLibp2p", remotePeerIdInfo);
            clearInterval(timeInterval);
            timeIntervalStart();
          } catch (error) {
            reject(new Error("FindPeer Failed"));
          }
        }, 1000);
      }
    });
  }

  subscribe() {
    this.channels!.forEach((channel) => {
      (this.libp2p!.services.pubsub as GossipSub).subscribe(channel.name);
    });
  }

  publishSubscribe(subscribe: string, message: Uint8Array | string) {
    if (typeof message === "string") {
      (this.libp2p!.services.pubsub as GossipSub).publish(
        subscribe,
        new TextEncoder().encode(message)
      );
    } else {
      (this.libp2p!.services.pubsub as GossipSub).publish(subscribe, message);
    }
  }

  async connectFriendLibp2p(peerId: PeerId | string): Promise<void> {
    return new Promise(async (resolve) => {
      const timeIntervalStart = (peerId: PeerId) => {
        const timeInterval = setInterval(async () => {
          try {
            const peerIdInfo = await this.libp2p?.peerRouting.findPeer(peerId);
            await this.libp2p?.dialProtocol(
              peerIdInfo!.id,
              this.libp2p.getProtocols()
            );
            clearInterval(timeInterval);
            resolve();
          } catch (error) {
            console.log("connect remotePeerId Failed ", error);
          }
        }, 1000);
      };
      if (typeof peerId === "string") {
        const pid = peerIdFromString(peerId);
        timeIntervalStart(pid);
      } else {
        timeIntervalStart(peerId);
      }
    });
  }
}
