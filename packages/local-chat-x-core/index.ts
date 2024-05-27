import { Libp2p } from "libp2p";
import { startRelayService } from "./libp2p.js";

const libp2p = (await startRelayService({
  onStarted: (listenMultiaddrArray) => {
    console.log("Relay service started on:");
    listenMultiaddrArray.forEach((addr) => {
      console.log("-> ", addr.toString());
    });
  },
  onStopped: () => console.log("Relay service stopped"),
})) as Libp2p;
// libp2p.addEventListener("connection:open", (connection) => {
//   console.log("connection:open", connection.detail);
// });
// libp2p.addEventListener("connection:close", (connection) => {
//   console.log("connection:open", connection.detail);
// });
// libp2p.addEventListener("connection:prune", (connection) => {
//   console.log("connection:prune", connection.detail);
// });
libp2p.addEventListener("peer:connect", (peerId) => {
  console.log("peer:connect ", peerId.detail);
});
libp2p.addEventListener("peer:disconnect", (peerId) => {
  console.log("peer:disconnect ", peerId.detail);
});
libp2p.addEventListener("peer:discovery", (peerIdInfo) => {
  console.log("peer:discovery ", peerIdInfo.detail);
});

// libp2p.addEventListener("peer:identify", (identifyResult) => {
//   console.log("peer:identify ", identifyResult.detail);
// });
// libp2p.addEventListener("peer:update", (peerUpdate) => {
//   console.log("peer:update ", peerUpdate.detail);
// });
// libp2p.addEventListener("self:peer:update", (peerUpdate) => {
//   console.log("self:peer:update ", peerUpdate.detail);
//   console.log("self:peer:update protocols", libp2p?.getProtocols());
//   console.log("self:peer:update multiaddrs", libp2p?.getMultiaddrs());
//   libp2p?.getMultiaddrs().forEach((multiaddr, index) => {
//     console.log(`self:peer:update multiaddr ${index} ${multiaddr.toString()}`);
//   });
//   console.log("self:peer:update dialQueue", libp2p?.getDialQueue());
//   console.log("self:peer:update connections", libp2p?.getConnections());
//   console.log("self:peer:update peers", libp2p?.getPeers());
// });
libp2p.addEventListener("start", () => {
  console.log("start");
  // console.log("protocols", libp2p?.getProtocols());
  // console.log("multiaddrs", libp2p?.getMultiaddrs());
  // console.log("dialQueue", libp2p?.getDialQueue());
  // console.log("connections", libp2p?.getConnections());
  // console.log("peers", libp2p?.getPeers());
});
libp2p.addEventListener("stop", () => {
  console.log("stop");
});
// libp2p.addEventListener("transport:close", (listener) => {
//   console.log("transport:close", listener.detail);
// });
// libp2p.addEventListener("transport:listening", (listener) => {
//   console.log("transport:listening", listener.detail);
// });
