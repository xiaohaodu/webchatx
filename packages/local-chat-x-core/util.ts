import { peerIdFromKeys } from "@libp2p/peer-id";
import { unmarshalPrivateKey } from "@libp2p/crypto/keys";
import { createEd25519PeerId } from "@libp2p/peer-id-factory";
import sshpk from "sshpk";

// 解析私钥
export function parsePrivateKey(sshPrivateKey: string) {
  try {
    const privateKey = sshpk.parsePrivateKey(sshPrivateKey, "auto");
    return privateKey;
  } catch (error) {
    console.error("Failed to parse private key:", error);
    return null;
  }
}

// 解析公钥
export function parsePublicKey(sshPublicKey: string) {
  try {
    const publicKey = sshpk.parseKey(sshPublicKey, "auto");
    return publicKey;
  } catch (error) {
    console.error("Failed to parse public key:", error);
    return null;
  }
}

export async function parsePrivateKeySecret(
  secretEd25519Base64StringReg: string
) {
  const keyPairImport = Uint8Array.from(
    Buffer.from(secretEd25519Base64StringReg, "base64")
  );
  const keyPairU = await unmarshalPrivateKey(keyPairImport);
  return keyPairU;
}
export async function parsePrivateKeySecretToPeerId(
  secretEd25519Base64StringReg: string
) {
  const keyPairImport = Uint8Array.from(
    Buffer.from(secretEd25519Base64StringReg, "base64")
  );
  const keyPairU = await unmarshalPrivateKey(keyPairImport);
  const peerId = await peerIdFromKeys(keyPairU.public.bytes, keyPairU.bytes);
  return peerId;
}

export const generateAndExportPeerInfo = async () => {
  const peerId = await createEd25519PeerId();
  return {
    secretEd25519Base64String: Buffer.from(peerId.privateKey!).toString(
      "base64"
    ),
    peerId: peerId.toString(),
  };
};
