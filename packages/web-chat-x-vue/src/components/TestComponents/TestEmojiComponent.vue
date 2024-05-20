<template>
  <div ref="refEmojiPicker"></div>
</template>
<script lang="ts" setup>
import "emoji-picker-element";
// import zh_CN from "emoji-picker-element/i18n/zh_CN";
import { Picker } from "emoji-picker-element";
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
// emoji-picker-element will use "Twemoji Mozilla" and fall back to other fonts for non-flag emoji
polyfillCountryFlagEmojis("Twemoji Mozilla");
const refEmojiPicker = ref() as Ref<Picker>;
const picker = new Picker({
  // i18n: zh_CN,
  // locale: "zh_CN",
});
onMounted(() => {
  refEmojiPicker.value.appendChild(picker);
  picker.addEventListener("emoji-click", (event: any) =>
    console.log(event.detail.unicode)
  );
});
</script>
