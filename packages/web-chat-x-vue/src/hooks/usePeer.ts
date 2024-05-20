import { PeerManager } from "@/classes/PeerManager";

export default function usePeer() {
  const peerManager = inject<PeerManager | undefined>("peerManager");
  if (!peerManager) {
    throw new Error("The PeerManager instance has not been initialized");
  }
  return {
    peerManager: peerManager!,
  };
}
