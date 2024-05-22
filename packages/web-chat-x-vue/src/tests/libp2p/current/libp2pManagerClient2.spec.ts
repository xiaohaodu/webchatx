import { Libp2pManager } from "../../../classes/Libp2pManager.ts";
import { multiaddr } from "@multiformats/multiaddr";

const libp2pServer = new Libp2pManager();
await libp2pServer.createLibp2pNode();

try {
  await libp2pServer.startLibp2pNode(
    multiaddr(
      "/dns/webchatx.mayuan.work/tcp/9000/ws/p2p/12D3KooWFzsY7wUBHwbrz6m9nFfLCDwqLD4LS9JykKxSZ4zqG7Pg"
    )
  );
} catch (error) {
  console.log(error);
}
