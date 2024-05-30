import express from "express";
import cors from "cors";
const app = express();
const port = 8000;

import Libp2pManager from "./libp2p.js";
const libp2pManager = new Libp2pManager();
libp2pManager.startRelayService();

import morgan from "morgan";

app.use(morgan("combined"));
app.use(cors());

app.get("/test", (_req, res) => {
  res.send({
    type: "message",
    message: "you testing the local-webchat-x-core http://127.0.0.1:" + port,
  });
});

app.get("/libp2p", async (_req, res) => {
  const peerStore = await libp2pManager.libp2p.peerStore.all();
  res.send(peerStore);
});

app.listen(port, () => {
  console.log(
    `local relay node running with prot ${port},http://127.0.0.1:${port}`
  );
});
