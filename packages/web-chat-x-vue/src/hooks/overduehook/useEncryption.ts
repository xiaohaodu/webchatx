// crypto-utils.ts
import forge from "node-forge";
import crc32 from "crc-32";

// 自定义Ed25519密钥类型
interface Ed25519KeyPair {
  publicKey: string;
  privateKey: string;
}

interface Ed25519KeyPairHash {
  publicKeyHash: string;
  privateKeyHash: string;
}

// 创建一个Ed25519密钥对
function generateEccKeyPair(): {
  eccKeyPair: Ed25519KeyPair;
  eccKeyPairHash: Ed25519KeyPairHash;
} {
  const keyPair = forge.pki.ed25519.generateKeyPair();
  return {
    eccKeyPair: {
      publicKey: keyPair.publicKey.toString("hex"),
      privateKey: keyPair.privateKey.toString("hex"),
    },
    eccKeyPairHash: {
      publicKeyHash: getKeyHash(keyPair.publicKey.toString("hex")),
      privateKeyHash: getKeyHash(keyPair.publicKey.toString("hex")),
    },
  };
}

// 从ECC密钥计算唯一哈希值
function getKeyHash(key: string): string {
  const hash = forge.md.sha256.create().update(key, "utf8");
  return forge.util.bytesToHex(hash.digest().getBytes()).toUpperCase();
}

function generateRandomHexChars(length = 8): string {
  let result = "";
  const characters = "0123456789abcdef";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 计算并构建用户ID
function buildUserId(publicKey: string, obfuscationCode: string): string {
  const publicKeyHash = getKeyHash(publicKey);
  const combined = publicKeyHash + obfuscationCode;
  const crcChecksum = crc32
    .str(combined)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
  return combined + crcChecksum;
}

// 验证用户ID
function isValidUserId(userId: string): boolean {
  const matchResult = userId.match(
    /^([0-9a-f]{64})([0-9a-f]{8})([0-9a-f]{4})$/i
  );
  if (!matchResult) return false;

  const [, publicKeyHashPart, obfuscationCodePart, providedChecksum] =
    matchResult;

  const expectedChecksum = crc32
    .str(publicKeyHashPart + obfuscationCodePart)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");

  return providedChecksum === expectedChecksum;
}

// 封装为Vue3的Hook
export default function useEncryption() {
  // 在hook内部创建ref存储eccKeyPair和userId
  const eccKeyPair = ref<Ed25519KeyPair>({
    publicKey: "",
    privateKey: "",
  });
  const id = ref<string>("");
  const eccKeyPairHash = ref<Ed25519KeyPairHash>({
    publicKeyHash: "",
    privateKeyHash: "",
  });
  const obfuscationCode = ref("");

  // 生成密钥对及用户ID的方法
  function generateAndSetIdentifier() {
    const generatedPair = generateEccKeyPair();
    eccKeyPair.value = generatedPair.eccKeyPair;
    eccKeyPairHash.value = generatedPair.eccKeyPairHash;
    obfuscationCode.value = generateRandomHexChars();
    id.value = buildUserId(eccKeyPair.value.publicKey, obfuscationCode.value);
  }

  // 对外暴露验证用户ID的函数
  function validateUserId(inputUserId: string): boolean {
    return isValidUserId(inputUserId);
  }

  // 对密码进行哈希的函数
  function hashPassword(password: string): string {
    return getKeyHash(password);
  }

  // 初始化用户标识符
  generateAndSetIdentifier();

  return {
    id,
    eccKeyPair,
    eccKeyPairHash,
    obfuscationCode,
    validateUserId,
    hashPassword,
  };
}
