import express from "express";
import { generatePeerServer } from "./controllers/peer.js";
import { startRelayService } from "./controllers/libp2p.js";
import cors from "cors";
import morgan from "morgan";
// import { createServer } from "https";
// import { readFileSync } from "fs";
// import { fileURLToPath } from "url";
// import { dirname, join } from "path";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// import { bootstrap } from "@libp2p/bootstrap";
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
// const server = createServer(
//   {
//     cert: readFileSync(
//       join(
//         __dirname,
//         "./certs/webchatx.mayuan.work_nginx/webchatx.mayuan.work_bundle.pem"
//       )
//     ), // 指定证书文件路径
//     key: readFileSync(
//       join(
//         __dirname,
//         "./certs/webchatx.mayuan.work_nginx/webchatx.mayuan.work.key"
//       )
//     ), // 指定私钥文件路径
//   },
//   app
// );
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
const peerServer = generatePeerServer(server);
app.use("/peer", peerServer);
