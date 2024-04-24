import crc32 from "crc-32";
import { peerIdFromKeys } from "@libp2p/peer-id";
import { PeerId } from "@libp2p/interface";
import { generateKeyPair } from "@libp2p/crypto/keys";
import { sha256 } from "multiformats/hashes/sha2";
import { toHex } from "multiformats/bytes";

// 创建一个Ed25519密钥对
async function generatePeerId(): Promise<PeerId> {
  const keyPair = await generateKeyPair("Ed25519");
  const peerId = await peerIdFromKeys(keyPair.public.bytes, keyPair.bytes);
  return peerId;
}

// 从ECC密钥计算唯一哈希值
async function getKeyHash(key: string | Uint8Array): Promise<string> {
  let keyUint8Array: Uint8Array;

  if (key instanceof Uint8Array) {
    keyUint8Array = key;
  } else {
    // 使用 TextEncoder 将字符串编码为 Uint8Array
    const encoder = new TextEncoder();
    keyUint8Array = encoder.encode(key);
  }
  // 使用 @libp2p/crypto 提供的 sha256 方法计算哈希
  const hash = await sha256.encode(keyUint8Array);
  return toHex(hash);
}

function generateRandomHexChars(length = 8): string {
  let result = "";
  const characters =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 计算并构建用户ID
async function buildUserId(
  peerId: string,
  obfuscationCode: string,
  hash = false
): Promise<string> {
  if (hash) {
    const peerIdHash = await getKeyHash(peerId);
    const combined = peerIdHash + obfuscationCode;
    const crcChecksum = crc32.str(combined).toString(16);
    return combined + crcChecksum;
  } else {
    const combined = peerId + obfuscationCode;
    const crcChecksum = crc32.str(combined).toString(16);
    return combined + crcChecksum;
  }
}

// 验证用户ID
// 对外暴露验证用户ID的函数
export function isValidUserId(userId: string): boolean {
  const matchResult = userId.match(
    /^([1-9A-HJ-NP-Za-km-z]{52})([1-9A-HJ-NP-Za-km-z]{8})-?([0-9a-f]{8})$/
  );
  if (!matchResult) return false;
  const [, peerId, obfuscationCodePart, providedChecksum] = matchResult;
  const expectedChecksum = crc32
    .str(peerId + obfuscationCodePart)
    .toString(16)
    .slice(-8);
  return providedChecksum === expectedChecksum;
}

export function getPeerIdFromUserId(userId: string): string {
  const matchResult = userId.match(
    /^([1-9A-HJ-NP-Za-km-z]{52})([1-9A-HJ-NP-Za-km-z]{8})-?([0-9a-f]{8})$/
  );
  if (!matchResult) {
    throw Error("UserId is not validate");
  }

  const [, peerId] = matchResult;
  return peerId;
}

// 对密码进行哈希的函数
export async function hashPassword(password: string): Promise<string> {
  return await getKeyHash(password);
}

export default async function useEncryption() {
  const id = ref<string>("");
  const peerId = ref<PeerId>();
  const obfuscationCode = ref("");

  // 生成密钥对及用户ID的方法
  async function generateAndSetIdentifier() {
    peerId.value = await generatePeerId();
    obfuscationCode.value = generateRandomHexChars();
    id.value = await buildUserId(
      peerId.value.toString(),
      obfuscationCode.value
    );
  }

  // 初始化用户标识符
  await generateAndSetIdentifier();

  return {
    id,
    peerId,
    obfuscationCode,
  };
}
