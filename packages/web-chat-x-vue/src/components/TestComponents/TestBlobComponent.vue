<template>
  <div>TestBlobComponent</div>
</template>
<script lang="ts" setup>
import generateAndSetIdentifier from "@/hooks/generateAndSetIdentifier";

// 定义分隔符，这里使用一个不太可能在数据中出现的字节序列
const separatorBytes = new Uint8Array([0, 255, 238, 221]); // 对应于\x00\xFF\xEE\xDD

async function combineMultipleBlobs(blobs: Blob[]): Promise<Blob> {
  let combinedArray = new Uint8Array(0);

  for (const blob of blobs) {
    const currentArray = new Uint8Array(await blob.arrayBuffer());
    if (combinedArray.length > 0) {
      combinedArray = concatTypedArrays(combinedArray, separatorBytes); // 在每个Blob之间插入分隔符
    }
    combinedArray = concatTypedArrays(combinedArray, currentArray);
  }

  return new Blob([combinedArray]);
}

// 辅助函数，用于合并两个Uint8Array
function concatTypedArrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const c = new Uint8Array(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}

async function splitMultipleBlobs(combinedBlob: Blob): Promise<Blob[]> {
  const combinedArray = new Uint8Array(await combinedBlob.arrayBuffer());
  let startIndex = 0;
  const blobs: Blob[] = [];

  // 外层循环确保处理完所有分隔符
  while (startIndex < combinedArray.length) {
    // 查找下一个分隔符的位置
    const separatorIndex = combinedArray.findIndex(
      (_, index) =>
        index >= startIndex && // 确保从startIndex开始查找
        index + separatorBytes.length <= combinedArray.length &&
        combinedArray
          .slice(index, index + separatorBytes.length)
          .every((v, i) => v === separatorBytes[i])
    );

    // 如果找不到分隔符（即到达最后一个Blob），则处理剩余部分并跳出循环
    if (separatorIndex === -1) {
      blobs.push(new Blob([combinedArray.slice(startIndex)]));
      break;
    }

    // 提取当前Blob的内容
    blobs.push(new Blob([combinedArray.slice(startIndex, separatorIndex)]));

    // 更新起始搜索位置到当前分隔符之后
    startIndex = separatorIndex + separatorBytes.length;
  }

  return blobs;
}

async function main() {
  const blob1 = new Blob(["Blob 1 content"]);
  // const blob2 = new Blob(["Blob 2 content"]);
  // const blob3 = new Blob(["Blob 3 content"]);
  // const blob4 = new Blob(["Blob 4 content "]);

  // 合并四个Blob
  // const combinedBlob = await combineMultipleBlobs([blob1, blob2, blob3, blob4]);
  const combinedBlob = await combineMultipleBlobs([blob1]);

  let file = new File([combinedBlob], "1", { type: "application/json" });

  // 拆分Blob
  try {
    const extractedBlobs = await splitMultipleBlobs(file);
    console.log(blob1, extractedBlobs);
    for (let i = 0; i < extractedBlobs.length; i++) {
      console.log(`Blob ${i + 1}:`, await extractedBlobs[i].text());
    }
  } catch (error) {
    console.error(error);
  }
}

main();
import { Typeson } from "typeson";
import { date, blob, file, arraybuffer } from "typeson-registry";

const { peerId } = await generateAndSetIdentifier();
// 初始化Typeson实例并配置注册表
const typeson = new Typeson().register([date, blob, file, arraybuffer]);
const _peerIdJson = await typeson.encapsulate(peerId.value);
const __peerIdJson = typeson.stringify(_peerIdJson);
console.log(peerId.value?.multihash.digest.buffer, _peerIdJson, __peerIdJson);
</script>
