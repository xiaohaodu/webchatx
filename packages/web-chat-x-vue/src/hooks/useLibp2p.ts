import { Libp2pManager } from "@/classes/Libp2pManager";

export default function useLibp2p() {
  let libp2pManager = inject<Ref<Libp2pManager | undefined>>("libp2pManager");
  if (!libp2pManager?.value) {
    throw new Error("The Libp2pManager instance has not been initialized.");
  }
  const resetLibp2p = () => {
    libp2pManager.value?.clear();
    libp2pManager.value = new Libp2pManager();
  };
  return {
    resetLibp2p,
    libp2pManager: libp2pManager.value!,
  };
}
