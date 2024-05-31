import { PeerManager } from "@/classes/PeerManager";

export default function usePeer() {
  const peerManager = inject<Ref<PeerManager | undefined>>("peerManager");
  if (!peerManager?.value) {
    throw new Error("The PeerManager instance has not been initialized");
  }
  const resetPeerManager = () => {
    peerManager.value?.clear();
    peerManager.value?.cleanupResources();
    peerManager.value = new PeerManager();
  };
  return {
    resetPeerManager,
    peerManager: peerManager.value!,
  };
}
