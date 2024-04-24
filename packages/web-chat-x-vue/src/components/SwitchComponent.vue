<template>
  <div
    style="
      height: 58px;
      display: flex;
      justify-content: center;
      align-items: center;
    "
    @click="toggleDarkMode()"
  >
    <div :class="isDark ? 'switch_open switch' : 'switch_close switch'">
      <img class="switch__icon" src="@/assets/moon.svg" v-show="isDark" />
      <img class="switch__icon" src="@/assets/sun.svg" v-show="!isDark" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDarkMode } from "@/hooks/useDark";

const { isDark, toggleDarkMode } = useDarkMode();
</script>

<style lang="scss" scoped>
@keyframes open_to_close {
  0% {
    left: 22px;
  }

  100% {
    left: 0;
  }
}

@keyframes close_to_open {
  0% {
    left: 0;
  }

  100% {
    left: 22px;
  }
}

.switch_open {
  position: relative;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background-color: #4a4b4d;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.5s;

  .switch__icon {
    position: absolute;
    border-width: 2px 2px 2px 2px;
    width: 18px;
    height: 18px;
    left: 22px;
    border-radius: 9px;
    background-color: #141414;
    animation: close_to_open 0.3s;
  }
}

.switch_close {
  position: relative;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background-color: #f2f2f2;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.5s;

  .switch__icon {
    position: absolute;
    border-width: 2px 2px 2px 2px;
    width: 18px;
    height: 18px;
    border-radius: 9px;
    background-color: #ffffff;
    animation: open_to_close 0.3s;
  }
}
</style>
