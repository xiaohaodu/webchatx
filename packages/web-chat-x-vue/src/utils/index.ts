/**
 * 创建一个可控制的循环调用函数，模拟setInterval的行为，但使用setTimeout实现，
 * 提供了更好的控制能力，避免潜在的累积执行间隔问题。
 *
 * @param callback 要循环调用的函数
 * @param interval 循环调用的间隔时间，单位为毫秒
 * @returns 一个对象，包含开始和停止循环的函数
 */
export function createLoopFunction<T extends (...args: any[]) => void>(
  callback: T,
  interval: number
): {
  start: () => void;
  stop: () => void;
} {
  let timerId: NodeJS.Timeout | null = null;

  const execute = () => {
    callback();
    timerId = setTimeout(execute, interval);
  };

  /**
   * 开始循环调用
   */
  const start = () => {
    if (!timerId) {
      timerId = setTimeout(execute, interval);
    }
  };

  /**
   * 停止循环调用
   */
  const stop = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  // 返回控制对象
  return { start, stop };
}
/**
 * 将File对象转换为base64编码的字符串。
 * 使用FileReader的readAsDataURL方法异步读取文件内容。
 */
export async function fileToBase64(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        resolve(event.target.result.toString());
      } else {
        reject(new Error("Failed to read file as base64."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
/**
 * 将base64编码的字符串转换回File对象。
 * 解码base64字符串，创建一个新的Blob，然后封装为File对象。
 */
export function base64ToFile(
  fileName: string,
  mimeType: string,
  base64String: string
): File {
  const arr = base64String.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mimeType });
}

import crc32 from "crc/crc32";
import { peerIdFromKeys, peerIdFromString } from "@libp2p/peer-id";
import { PeerId } from "@libp2p/interface";
import { generateKeyPair } from "@libp2p/crypto/keys";
/**
 * 生成一个Ed25519类型的PeerId。
 * 使用`@libp2p/crypto`生成密钥对，并通过公钥创建PeerId。
 */
async function generatePeerId(): Promise<PeerId> {
  const keyPair = await generateKeyPair("Ed25519");
  const peerId = await peerIdFromKeys(keyPair.public.bytes, keyPair.bytes);
  return peerId;
}
/**
 * 生成指定长度的随机十六进制字符字符串，用于混淆代码等场景。
 */
export function generateRandomHexChars(length = 8): string {
  let result = "";
  const characters =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * 构建用户ID，结合PeerId、混淆代码，并可选地计算CRC校验和。
 */
export async function buildUserId(
  peerId: string,
  obfuscationCode: string
): Promise<string> {
  const combined = peerId + obfuscationCode;
  const crcChecksum = crc32(combined).toString(16);
  return combined + crcChecksum;
}

/**
 * 验证用户ID是否有效，检查其结构和CRC校验和。
 */
export function isValidUserId(userId: string): boolean {
  const matchResult = userId.match(
    /^([1-9A-HJ-NP-Za-km-z]{52})([1-9A-HJ-NP-Za-km-z]{8})([0-9a-f]{8})$/
  );
  if (!matchResult) return false;
  const [, peerId, obfuscationCodePart, providedChecksum] = matchResult;
  const expectedChecksum = crc32(peerId + obfuscationCodePart).toString(16);
  return providedChecksum === expectedChecksum;
}

/**
 * 将用户ID拆分为PeerId、混淆码和CRC校验和三部分。
 *
 * @param userId 完整的用户ID字符串
 * @returns 包含三部分的元组 [PeerId, 混淆码, CRC校验和]
 * @throws 如果用户ID格式不正确，则抛出错误
 */
export function splitUserId(userId: string): {
  peerId: string;
  obfuscationCode: string;
  crcChecksum: string;
} {
  // 使用正则表达式匹配并提取各部分
  const matchResult = userId.match(
    /^([1-9A-HJ-NP-Za-km-z]{52})([1-9A-HJ-NP-Za-km-z]{8})([0-9a-f]{8})$/
  );

  if (!matchResult) {
    throw new Error("Invalid UserId format.");
  }

  // 解构匹配结果并返回
  const [_, peerId, obfuscationCode, crcChecksum] = matchResult;
  return {
    peerId,
    obfuscationCode,
    crcChecksum,
  };
}
/**
 * 从用户ID中提取混淆码部分。
 *
 * @param userId 已构建的用户ID字符串
 * @returns 混淆码字符串
 * @throws 如果用户ID格式不正确，则抛出错误
 */
export function getObfuscationCodeFromUserId(userId: string): string {
  // 使用正则表达式匹配并提取混淆码部分
  const matchResult = userId.match(
    /^([1-9A-HJ-NP-Za-km-z]{52})([1-9A-HJ-NP-Za-km-z]{8})([0-9a-f]{8})$/
  );

  if (!matchResult) {
    throw new Error("Invalid UserId format.");
  }

  // 返回匹配到的混淆码部分
  return matchResult[2];
}
/**
 * 从用户ID中提取PeerId部分。
 */
export function getPeerIdFromUserId(userId: string): string {
  const matchResult = userId.match(
    /^([1-9A-HJ-NP-Za-km-z]{52})([1-9A-HJ-NP-Za-km-z]{8})([0-9a-f]{8})$/
  );
  if (!matchResult) {
    throw new Error("UserId is not validate");
  }

  const [, peerId] = matchResult;
  return peerId;
}

/**
 * 生成或设置标识符（PeerId、混淆代码、用户ID）的方法。
 * 可以接受外部提供的PeerId字符串，或自动生成，同时创建混淆代码和用户ID。
 */
export async function generateAndSetIdentifier(
  peerIdString: string = "",
  noEncrypt = false
) {
  let peerId: PeerId;
  if (peerIdString) {
    peerId = peerIdFromString(peerIdString);
  } else if (!noEncrypt) {
    peerId = await generatePeerId();
  } else {
    const generatedPeerId = await generatePeerId();
    peerId = peerIdFromString(generatedPeerId.toString());
  }
  const obfuscationCode = generateRandomHexChars();
  const id = await buildUserId(peerId.toString(), obfuscationCode);
  return { peerId, obfuscationCode, id };
}
