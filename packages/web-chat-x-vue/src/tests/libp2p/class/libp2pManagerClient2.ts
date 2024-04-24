import { Libp2pManager } from "./Libp2pManager.ts";
import { multiaddr } from "@multiformats/multiaddr";

const libp2pServer = new Libp2pManager();
await libp2pServer.createLibp2pNode();

try {
  await libp2pServer.startLibp2pNode(
    multiaddr(
      "/ip4/127.0.0.1/tcp/6000/ws/p2p/12D3KooWFzsY7wUBHwbrz6m9nFfLCDwqLD4LS9JykKxSZ4zqG7Pg"
    )
  );
} catch (error) {
  console.log(error);
}
