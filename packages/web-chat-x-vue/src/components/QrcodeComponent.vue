<template>
  <div class="flex flex-row select-none cursor-pointer">
    <canvas ref="canvas"></canvas>
    <div class="flex flex-col justify-around">
      <div class="text-sm">此二维码包含您的ID。您可以将它分享给朋友们</div>
      <el-button @click="saveImage">保存图像</el-button>
      <el-button @click="copyImage">复制图像</el-button>
    </div>
    <a ref="download" v-show="false"></a>
  </div>
</template>

<script lang="ts" setup>
import QRCode from "qrcode";
interface QRCodeProps {
  value: string;
}

const props = defineProps<QRCodeProps>();
const qrCodeUrl = ref("");
const download = ref() as Ref<HTMLAnchorElement>;
const canvas = ref() as Ref<HTMLCanvasElement>;
async function generateQRCode() {
  try {
    qrCodeUrl.value = await QRCode.toDataURL(canvas.value, props.value);
  } catch (error) {
    console.error(error);
  }
}

watch(canvas, () => {
  generateQRCode();
});

// Function to save the QR code image
function saveImage() {
  download.value.href = qrCodeUrl.value;
  download.value.download = "QRCode.png";
  download.value.click();
}

// Function to copy the QR code image URL to clipboard
function copyImage() {
  canvas.value.toBlob(async (blob) => {
    console.log(blob);
    const data = [
      new ClipboardItem({
        [blob!.type]: blob!,
      }),
    ]; // https://w3c.github.io/clipboard-apis/#dom-clipboard-write
    try {
      await navigator.clipboard.write(data);
      console.log("Copied to clipboard successfully!");
    } catch (error) {
      console.error("Unable to write to clipboard:", error);
    }
  });
}
</script>

<style lang="scss" scoped>
.el-button + .el-button {
  margin: 0;
}
</style>
