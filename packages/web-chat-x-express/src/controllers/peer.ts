import { Server } from "http";
import { ExpressPeerServer } from "peer";
export function generatePeerServer(server: Server) {
  return ExpressPeerServer(server, {
    path: "/",
  });
}
