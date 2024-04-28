import { useDark, useToggle } from "@vueuse/core";
// 封装 useDarkMode 钩子
export function useDarkMode() {
  // 初始时根据系统设置获取暗黑模式状态
  const isDark = useDark();

  // 使用 useToggle 创建切换暗黑模式的函数和对应的布尔值状态
  const toggleDark = useToggle(isDark);

  return {
    isDark,
    toggleDark,
  };
}
