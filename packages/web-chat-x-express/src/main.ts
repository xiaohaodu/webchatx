import express from "express";
import PeerServerWrapper from "./controllers/peer.js";
import cors from "cors";
import morgan from "morgan";
const app = express();
const port = 8099;
app.use(cors());
// 使用 body-parser 中间件解析请求体
app.use(express.json({ limit: 10 * 1024 * 1024 }));
app.use(express.urlencoded({ extended: true, limit: 10 * 1024 * 1024 }));
app.use(morgan("combined"));
const server = app.listen(port, () => {
  console.log(`webrtc-peer-express app listen on http://localhost:${port}`);
});

import Libp2pManager from "./controllers/libp2p.js";
const libp2pManager = new Libp2pManager();
libp2pManager.startRelayService();

// 直接在构造函数中初始化 Peer 服务器
const peerServerWrapper = new PeerServerWrapper(server);
// 然后你可以通过 getter 方法获取 Peer 服务器实例
const peerServer = peerServerWrapper.getPeerServer();
app.use("/peer", peerServer);
