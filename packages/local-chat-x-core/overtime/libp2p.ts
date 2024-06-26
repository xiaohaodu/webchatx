// 导入所需的 Libp2p 相关模块及依赖组件
import { Libp2p, createLibp2p } from "libp2p";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { webSockets } from "@libp2p/websockets";
import { webRTC } from "@libp2p/webrtc";
import * as filters from "@libp2p/websockets/filters";
import type { Multiaddr } from "@multiformats/multiaddr";
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
];
/**
 * 定义 RelayServiceOptions 类型，用于配置启动和停止回调函数
 * */
type RelayServiceOptions = {
  onStarted?: (listenMultiaddrArray: Multiaddr[]) => void; // 当 Relay 服务成功启动时调用的回调，接收监听地址作为参数
  onStopped?: () => void; // 当 Relay 服务成功停止时调用的回调
};

/**
 * 启动 Relay 服务的异步函数。接受可选的 RelayServiceOptions 参数以配置启动和停止回调。
 * */
async function startRelayService(
  options?: RelayServiceOptions
): Promise<Libp2p | void> {
  let libp2p: Libp2p | undefined;
  try {
    // 创建并初始化 Relay 节点
    libp2p = await createRelayNode();
    (libp2p.services.dht as KadDHT).setMode("server");
    // 获取 Relay 节点的监听地址，并确保找到一个 IPv4 地址
    const listenMultiaddr = libp2p.getMultiaddrs();
    // 如果提供了 onStarted 回调，则在服务启动后调用它，传入监听地址
    if (options?.onStarted) {
      options.onStarted(listenMultiaddr);
    }
    return libp2p;
  } catch (error) {
    // 如果启动过程中发生错误，打印错误信息并尝试停止已创建的 Relay 节点
    console.error("Failed to start relay service:", error);
    if (libp2p) {
      await stopRelayService(libp2p);
    }
    return;
  }
}

/**
 * 创建一个用于充当 Relay 节点的 Libp2p 实例。返回一个 Promise<Libp2p>。
 */
async function createRelayNode(): Promise<Libp2p> {
  // 配置 Libp2p 参数，包括：
  //   - 监听地址：设置为任意 IPv4 地址上的 WebSocket 连接
  //   - 传输层：使用 WebSocket 传输，应用所有可用过滤器
  //   - 连接加密：使用 Noise 加密方案
  //   - 流复用：使用 Yamux 流复用协议
  //   - 服务：启用 Circuit Relay Server（中继服务）
  const peerId = await createEd25519PeerId();
  return await createLibp2p({
    addresses: {
      listen: [
        "/ip4/127.0.0.1/tcp/9000/ws",
        "/ip4/127.0.0.1/tcp/10000/ws",
        "/webrtc",
      ], // 替换为实际希望监听的 IP 和端口
    },
    transports: [
      webSockets({
        filter: filters.all,
      }),
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
      // bootstrap({
      //   list: [],
      // }),
      pubsubPeerDiscovery({
        interval: 10000,
        topics: topics, // defaults to ['_peer-discovery._p2p._pubsub']
        listenOnly: false,
      }),
    ],
    peerId: peerId,
  });
}

/**
 * 停止指定的 Libp2p 实例（Relay 节点）。接受可选的 RelayServiceOptions 参数以配置停止回调。
 */
async function stopRelayService(
  libp2p?: Libp2p,
  options?: RelayServiceOptions
): Promise<void> {
  // 如果提供了有效的 Libp2p 实例，调用其 stop 方法停止服务
  if (libp2p) {
    await libp2p.stop();
    // 如果提供了 onStopped 回调，在服务成功停止后调用它
    if (options?.onStopped) {
      options.onStopped();
    }
  }
}

export { startRelayService };
