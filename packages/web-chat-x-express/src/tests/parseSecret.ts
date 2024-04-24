import {
  generateKeyPair,
  marshalPrivateKey,
  unmarshalPrivateKey,
} from "@libp2p/crypto/keys";

const kp = await generateKeyPair("Ed25519");
const mk = marshalPrivateKey(kp);
const bmk = Buffer.from(mk).toString("base64");
const kpi = Uint8Array.from(Buffer.from(bmk, "base64"));
const kpu = await unmarshalPrivateKey(kpi);
console.log(kp, mk, bmk, kpi, kpu);
console.log(kp.equals(kpu));
