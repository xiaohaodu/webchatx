import express from "express";
import { generatePeerServer } from "./controllers/peer.js";
import { startRelayService } from "./controllers/libp2p.js";
import cors from "cors";
const app = express();
const port = 8099;

const server = app.listen(port, () => {
  console.log(`webrtc-peer-express app listen on http://localhost:${port}`);
});

app.use(cors());

const peerServer = generatePeerServer(server);

// 启动 Relay 服务并配置启动和停止回调
startRelayService({
  onStarted: (listenMultiaddrArray) => {
    console.log("Relay service started on:");
    listenMultiaddrArray.forEach((addr) => {
      console.log("-> ", addr.toString());
    });
  },

  onStopped: () => console.log("Relay service stopped"),
});

app.use("/peer", peerServer);
