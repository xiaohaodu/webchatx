import { Libp2pManager } from "@/classes/Libp2pManager";

export default function useLibp2p() {
  const libp2pManager = inject<Libp2pManager | undefined>("libp2pManager");
  if (!libp2pManager) {
    throw new Error("The Libp2pManager instance has not been initialized.");
  }
  return {
    libp2pManager: libp2pManager!,
    createLibp2pNode: libp2pManager!.createLibp2pNode.bind(libp2pManager),
    startLibp2pNode: libp2pManager!.startLibp2pNode.bind(libp2pManager),
    getLibp2p: libp2pManager!.getLibp2p.bind(libp2pManager),
  };
}
