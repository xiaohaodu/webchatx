import { Libp2pManager } from "./Libp2pManager.spec.ts";
import { peerIdFromString } from "@libp2p/peer-id";

const libp2pServer = new Libp2pManager();
await libp2pServer.createLibp2pNode();
const remotePeerId = peerIdFromString(
  "12D3KooWFzsY7wUBHwbrz6m9nFfLCDwqLD4LS9JykKxSZ4zqG7Pg"
);
try {
  await libp2pServer.startLibp2pNode(undefined, remotePeerId);
} catch (error) {
  console.log(error);
}

await libp2pServer.connectFriendLibp2p(
  "12D3KooWF2XE3s7QLiZZCkK48ZapXwzLSF3qJ5Vt9XEdZDJ3QaYF"
);
