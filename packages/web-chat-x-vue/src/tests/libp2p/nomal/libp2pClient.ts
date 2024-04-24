import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { echo } from "@libp2p/echo";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { identify } from "@libp2p/identify";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { pipe } from "it-pipe";
import { createLibp2p } from "libp2p";
import { multiaddr } from "@multiformats/multiaddr";

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

dialer.addEventListener;

const address = multiaddr(
  "/ip4/127.0.0.1/tcp/50367/ws/p2p/12D3KooWG7FcVTCoctDvvHN91hFjhjDmajaEEsp62FvpHM98sVxx/p2p-circuit/webrtc/p2p/12D3KooWEhFDZPAasR2iyapVd9bCWhtHmPSFCPtQtR9stBpJDESV"
);
// dial the listener and open an echo protocol stream
const stream = await dialer.dialProtocol(
  address,
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
