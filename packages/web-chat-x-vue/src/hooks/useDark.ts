import { useDark, useToggle, useSupported } from "@vueuse/core";
import { watchEffect } from "vue";
const isSupported = useSupported(() => navigator && "getBattery" in navigator);
// 封装 useDarkMode 钩子
export function useDarkMode() {
  // 初始时根据系统设置获取暗黑模式状态
  const isDark = useDark();

  // 使用 useToggle 创建切换暗黑模式的函数和对应的布尔值状态
  const [darkMode, toggleDarkMode] = useToggle(isDark.value);

  // 在 SSR 环境下，由于无法获取系统主题，暂时禁用自动响应系统主题变更
  if (isSupported.value) {
    watchEffect(() => {
      isDark.value = darkMode.value;
    });
  }

  // 在客户端环境下，监听系统主题变更并同步到内部状态
  if (!isSupported.value) {
    watchEffect(() => {
      if (isDark.value !== darkMode.value) {
        darkMode.value = isDark.value;
      }
    });
  }

  return {
    isDark: darkMode,
    toggleDarkMode,
  };
}
