import { secretEd25519Base64String } from "../secretkey/secret.js";
import { unmarshalPrivateKey } from "@libp2p/crypto/keys";
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
  secretEd25519Base64StringReg: string = secretEd25519Base64String
) {
  const keyPairImport = Uint8Array.from(
    Buffer.from(secretEd25519Base64StringReg, "base64")
  );
  const keyPairU = await unmarshalPrivateKey(keyPairImport);
  return keyPairU;
}
