// 导入所需的 Libp2p 相关模块及依赖组件
import { Libp2p, createLibp2p } from "libp2p";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { webSockets } from "@libp2p/websockets";
import { webRTC } from "@libp2p/webrtc";
import * as filters from "@libp2p/websockets/filters";
import { echo } from "@libp2p/echo";
import { identify } from "@libp2p/identify";
import {
  KadDHT,
  kadDHT,
  removePrivateAddressesMapper,
  removePublicAddressesMapper,
} from "@libp2p/kad-dht";
import { createEd25519PeerId } from "@libp2p/peer-id-factory";
import { mdns } from "@libp2p/mdns";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { tls } from "@libp2p/tls";
import { prometheusMetrics } from "@libp2p/prometheus-metrics";
// import { bootstrap } from "@libp2p/bootstrap";
const topics = [
  `webChatX._peer-discovery._p2p._pubsub`, // It's recommended but not required to extend the global space
  // "_peer-discovery._p2p._pubsub", // Include if you want to participate in the global space
];

export default class Libp2pManager {
  libp2p: Libp2p | undefined;
  async createLibp2pNode(): Promise<void> {
    this.libp2p = await createLibp2p({
      addresses: {
        listen: [
          "/ip4/127.0.0.1/tcp/9000/ws",
          "/ip4/127.0.0.1/tcp/10000/ws",
          "/webrtc",
        ], // 替换为实际希望监听的 IP 和端口
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
      ],
      connectionEncryption: [noise(), tls()],
      streamMuxers: [yamux()],
      metrics: prometheusMetrics(),
      peerDiscovery: [
        pubsubPeerDiscovery({
          interval: 10000,
          topics: topics, // defaults to ['_peer-discovery._p2p._pubsub']
          listenOnly: false,
        }),
        mdns(),
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
        relay: circuitRelayServer({
          advertise: true,
        }),
        dht: kadDHT({
          kBucketSize: 20,
          clientMode: false,
        }),
        aminoDHT: kadDHT({
          protocol: "/ipfs/kad/1.0.0",
          peerInfoMapper: removePrivateAddressesMapper,
        }),
        lanDHT: kadDHT({
          protocol: "/ipfs/lan/kad/1.0.0",
          peerInfoMapper: removePublicAddressesMapper,
          clientMode: false,
        }),
      },
    });
    await this.libp2pHandleExpand();
  }
  libp2pHandleExpand() {
    throw new Error("Method not implemented.");
  }

  async startLibp2pNode(): Promise<void> {
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
      });
      this.libp2p.addEventListener("peer:disconnect", (peerId) => {
        console.log("peer:disconnect ", peerId.detail);
      });
      this.libp2p.addEventListener("peer:discovery", (peerIdInfo) => {
        console.log("peer:discovery ", peerIdInfo.detail);
      });
      // this.libp2p.addEventListener("peer:identify", (identifyResult) => {
      //   console.log("peer:identify ", identifyResult.detail);
      // });
      // this.libp2p.addEventListener("peer:update", (peerUpdate) => {
      //   console.log("peer:update ", peerUpdate.detail);
      // });
      this.libp2p.addEventListener("self:peer:update", (peerUpdate) => {
        console.log("self:peer:update ", peerUpdate.detail);
        console.log("protocols", this.libp2p?.getProtocols());
        console.log("multiaddrs", this.libp2p?.getMultiaddrs());
        this.libp2p?.getMultiaddrs().forEach((multiaddr, index) => {
          console.log(`multiaddr ${index} ${multiaddr.toString()}`);
        });
        console.log("dialQueue", this.libp2p?.getDialQueue());
        console.log("connections", this.libp2p?.getConnections());
        console.log("peers", this.libp2p?.getPeers());
      });
      this.libp2p.addEventListener("start", () => {
        console.log("start");
        // console.log("protocols", this.libp2p?.getProtocols());
        // console.log("multiaddrs", this.libp2p?.getMultiaddrs());
        // console.log("dialQueue", this.libp2p?.getDialQueue());
        // console.log("connections", this.libp2p?.getConnections());
        // console.log("peers", this.libp2p?.getPeers());
      });
      this.libp2p.addEventListener("stop", () => {
        console.log("stop");
      });
      // this.libp2p.addEventListener("transport:close", (listener) => {
      //   console.log("transport:close", listener.detail);
      // });
      // this.libp2p.addEventListener("transport:listening", (listener) => {
      //   console.log("transport:listening", listener.detail);
      // });
      try {
        await this.libp2p.dialProtocol([], this.libp2p?.getProtocols(), {
          signal: AbortSignal.timeout(5000),
        });
        timeIntervalStart();
        this.cyclicQuery();
      } catch (error) {
        reject(error);
      }
    });
  }
  cyclicQuery() {
    throw new Error("Method not implemented.");
  }
}
