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
import { pipe } from "it-pipe";
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
  "/ip4/127.0.0.1/tcp/53591/ws/p2p/12D3KooWGWHyRkPcttTU2BMwhk7cwoFozTNrDpaNHdRZXAAcJ4Vj"
);
console.log(address);
console.log(listener.getMultiaddrs(), listener.getProtocols());

await listener.dialProtocol(address, listener.getProtocols(), {
  signal: AbortSignal.timeout(5000),
});

let webRTCMultiaddr: Multiaddr | undefined;

// wait for the listener to make a reservation on the relay
while (true) {
  webRTCMultiaddr = listener.getMultiaddrs().find((ma) => WebRTC.matches(ma));

  if (webRTCMultiaddr != null) {
    break;
  }

  // try again later
  await delay(1000);
}

// the dialer has Circuit Relay, WebSocket and WebRTC transports to dial
// the listener via the relay, complete the SDP handshake and establish a
// direct WebRTC connection
const dialer = await createLibp2p({
  transports: [
    webSockets({ filter: filters.all }),
    webRTC(),
    circuitRelayTransport(),
  ],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    echo: echo(),
  },
});

// dial the listener and open an echo protocol stream
const stream = await dialer.dialProtocol(
  webRTCMultiaddr,
  dialer.services.echo.protocol,
  {
    signal: AbortSignal.timeout(5000),
  }
);

// send/receive some data from the remote peer via a direct connection
await pipe(
  [new TextEncoder().encode("hello world")],
  stream,
  async (source) => {
    for await (const buf of source) {
      console.info(new TextDecoder().decode(buf.subarray()));
    }
  }
);
