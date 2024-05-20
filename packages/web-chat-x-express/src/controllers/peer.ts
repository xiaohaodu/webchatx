import { Server } from "http";
import { ExpressPeerServer } from "peer";
export function generatePeerServer(server: Server) {
  return ExpressPeerServer(server, {
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
