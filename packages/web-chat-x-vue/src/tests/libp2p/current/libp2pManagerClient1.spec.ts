import { multiaddr } from "@multiformats/multiaddr";
import { Libp2pManager } from "../class/Libp2pManager.spec";

const libp2pServer = new Libp2pManager();
await libp2pServer.createLibp2pNode();
const relayMultiaddr = multiaddr(
  "/ip4/127.0.0.1/tcp/6000/ws/p2p/12D3KooWFzsY7wUBHwbrz6m9nFfLCDwqLD4LS9JykKxSZ4zqG7Pg"
);
try {
  await libp2pServer.startLibp2pNode(relayMultiaddr);
} catch (error) {
  console.log(error);
}

// await libp2pServer.connectFriendLibp2p(
//   multiaddr(
//     "/ip4/127.0.0.1/tcp/6000/ws/p2p/12D3KooWFzsY7wUBHwbrz6m9nFfLCDwqLD4LS9JykKxSZ4zqG7Pg/p2p-circuit/webrtc/p2p/12D3KooWGSWE92qZ6eKzGzwQ2Xzd8kKTAniaTKhnuPksM8U31bNM"
//   )
// );
