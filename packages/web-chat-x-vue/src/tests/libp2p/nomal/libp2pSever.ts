import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { echo } from "@libp2p/echo";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { WebRTC } from "@multiformats/multiaddr-matcher";
import delay from "delay";
import { createLibp2p } from "libp2p";
import { multiaddr, type Multiaddr } from "@multiformats/multiaddr";

// the listener has a WebSocket transport to dial the relay, a Circuit Relay
// transport to make a reservation, and a WebRTC transport to accept incoming
// WebRTC connections
const listener = await createLibp2p({
  addresses: {
    listen: ["/webrtc"],
  },
  transports: [
    webSockets({ filter: filters.all }),
    webRTC(),
    circuitRelayTransport({
      discoverRelays: 1,
    }),
  ],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    echo: echo(),
  },
});

// the listener dials the relay (or discovers a public relay via some other
// method)
const address = multiaddr(
  "/ip4/127.0.0.1/tcp/50367/ws/p2p/12D3KooWG7FcVTCoctDvvHN91hFjhjDmajaEEsp62FvpHM98sVxx"
);
console.log(address);

await listener.dial(address, {
  signal: AbortSignal.timeout(5000),
});

let webRTCMultiaddr: Multiaddr | undefined;

// wait for the listener to make a reservation on the relay
while (true) {
  webRTCMultiaddr = listener.getMultiaddrs().find((ma) => WebRTC.matches(ma));

  if (webRTCMultiaddr != null) {
    console.log(webRTCMultiaddr);
    break;
  }

  // try again later
  await delay(1000);
}
