import { Server } from "http";
import { ExpressPeerServer, PeerServerEvents } from "peer";
import { Express } from "express";
export default class PeerServerWrapper {
  private readonly peerServer: PeerServerEvents & Express;

  /**
   * 构造函数中直接初始化 Peer 服务器。
   * @param server HTTP 服务器实例
   */
  constructor(server: Server) {
    this.peerServer = ExpressPeerServer(server, {
      path: "/",
      proxied: true,
      corsOptions: {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
      },
    });
  }

  /**
   * 获取已初始化的 ExpressPeerServer 实例。
   */
  public getPeerServer(): PeerServerEvents & Express {
    return this.peerServer;
  }
}
