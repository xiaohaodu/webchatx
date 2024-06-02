// 导入所需的 Libp2p 相关模块及依赖组件
import { Libp2p, createLibp2p } from "libp2p";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { identify } from "@libp2p/identify";
import {
  KadDHT,
  kadDHT,
  removePrivateAddressesMapper,
  removePublicAddressesMapper,
} from "@libp2p/kad-dht";
import { peerIdFromKeys } from "@libp2p/peer-id";
import { parsePrivateKeySecret } from "../utils/parseSecret.js";
import { mdns } from "@libp2p/mdns";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { tls } from "@libp2p/tls";
import { prometheusMetrics } from "@libp2p/prometheus-metrics";
import { bootstrap } from "@libp2p/bootstrap";
const topics = [
  `webChatX._peer-discovery._p2p._pubsub`, // It's recommended but not required to extend the global space
];
export default class Libp2pManager {
  libp2p!: Libp2p;
  constructor() {}
  create() {}

  /**
   * 创建一个用于充当 Relay 节点的 Libp2p 实例。返回一个 Promise<Libp2p>。
   */
  private async createRelayNode(): Promise<Libp2p> {
    // 配置 Libp2p 参数，包括：
    //   - 监听地址：设置为任意 IPv4 地址上的 WebSocket 连接
    //   - 传输层：使用 WebSocket 传输，应用所有可用过滤器
    //   - 连接加密：使用 Noise 加密方案
    //   - 流复用：使用 Yamux 流复用协议
    //   - 服务：启用 Circuit Relay Server（中继服务）
    const keyPair = await parsePrivateKeySecret();
    const peerId = await peerIdFromKeys(keyPair.public.bytes, keyPair.bytes);
    return await createLibp2p({
      addresses: {
        listen: ["/ip4/0.0.0.0/tcp/9000/wss", "/ip4/0.0.0.0/tcp/10000/ws"], // 替换为实际希望监听的 IP 和端口
      },
      transports: [
        webSockets({
          filter: filters.all,
        }),
      ],
      connectionEncryption: [noise(), tls()],
      streamMuxers: [yamux()],
      metrics: prometheusMetrics(),
      services: {
        identify: identify(),
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
        pubsub: gossipsub(),
      },
      peerDiscovery: [
        mdns(),
        bootstrap({
          list: [
            "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
            "/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
            "/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
          ],
        }),
        pubsubPeerDiscovery({
          interval: 10000,
          topics: topics,
          listenOnly: false,
        }),
      ],
      peerId: peerId,
    });
  }
  private handleListenEvent() {
    this.libp2p.addEventListener("connection:open", (connection) => {
      console.log("connection:open", connection.detail);
    });
    this.libp2p.addEventListener("connection:close", (connection) => {
      console.log("connection:open", connection.detail);
    });
    this.libp2p.addEventListener("connection:prune", (connection) => {
      console.log("connection:prune", connection.detail);
    });
    this.libp2p.addEventListener("peer:connect", (peerId) => {
      console.log("peer:connect ", peerId.detail);
    });
    this.libp2p.addEventListener("peer:disconnect", (peerId) => {
      console.log("peer:disconnect ", peerId.detail);
    });
    this.libp2p.addEventListener("peer:discovery", (peerIdInfo) => {
      console.log("peer:discovery ", peerIdInfo.detail);
    });

    this.libp2p.addEventListener("peer:identify", (identifyResult) => {
      console.log("peer:identify ", identifyResult.detail);
    });
    this.libp2p.addEventListener("peer:update", (peerUpdate) => {
      console.log("peer:update ", peerUpdate.detail);
    });
    this.libp2p.addEventListener("self:peer:update", (peerUpdate) => {
      console.log("self:peer:update ", peerUpdate.detail);
      console.log("self:peer:update protocols", this.libp2p.getProtocols());
      console.log("self:peer:update multiaddrs", this.libp2p.getMultiaddrs());
      this.libp2p.getMultiaddrs().forEach((multiaddr, index) => {
        console.log(
          `self:peer:update multiaddr ${index} ${multiaddr.toString()}`
        );
      });
      console.log("self:peer:update dialQueue", this.libp2p.getDialQueue());
      console.log("self:peer:update connections", this.libp2p.getConnections());
      console.log("self:peer:update peers", this.libp2p.getPeers());
    });
    this.libp2p.addEventListener("start", () => {
      console.log("start");
      console.log("protocols", this.libp2p.getProtocols());
      console.log("multiaddrs", this.libp2p.getMultiaddrs());
      console.log("dialQueue", this.libp2p.getDialQueue());
      console.log("connections", this.libp2p.getConnections());
      console.log("peers", this.libp2p.getPeers());
    });
    this.libp2p.addEventListener("stop", () => {
      console.log("stop");
    });
    this.libp2p.addEventListener("transport:close", (listener) => {
      console.log("transport:close", listener.detail);
    });
    this.libp2p.addEventListener("transport:listening", (listener) => {
      console.log("transport:listening", listener.detail);
    });
  }

  private handleProtocol() {}
  /**
   * 停止指定的 Libp2p 实例（Relay 节点）。接受可选的 RelayServiceOptions 参数以配置停止回调。
   */
  public async stopRelayService(): Promise<void> {
    // 如果提供了有效的 Libp2p 实例，调用其 stop 方法停止服务
    if (this.libp2p) {
      console.log("Relay service stopped");
      await this.libp2p.stop();
    }
  }
  /**
   * 启动 Relay 服务的异步函数。
   * */
  public async startRelayService(): Promise<Libp2p | void> {
    try {
      // 创建并初始化 Relay 节点

      this.libp2p = await this.createRelayNode();
      (this.libp2p.services.dht as KadDHT).setMode("server");
      // 获取 Relay 节点的监听地址，并确保找到一个 IPv4 地址
      const listenMultiaddr = this.libp2p.getMultiaddrs();
      this.handleListenEvent();
      this.handleProtocol();
      console.log("Relay service started on:");
      listenMultiaddr.forEach((addr) => {
        console.log("-> ", addr.toString());
      });
      return this.libp2p;
    } catch (error) {
      // 如果启动过程中发生错误，打印错误信息并尝试停止已创建的 Relay 节点
      console.error("Failed to start relay service:", error);
      if (this.libp2p) {
        await this.stopRelayService();
      }
      return;
    }
  }
}
