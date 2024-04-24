import { ref, onUnmounted, nextTick } from "vue";
import { DialogOptions } from "@/types/dialogOptions";
import { ElDialog } from "element-plus";

export default function useDialog() {
  const dialogVisible = ref(false);
  const dialogInstance = ref<InstanceType<typeof ElDialog> | null>(null);

  async function open(options: DialogOptions) {
    if (!dialogInstance.value) {
      const instance = new ElDialog({
        ...options,
        modelValue: true,
        "onUpdate:modelValue": (value: boolean) => {
          dialogVisible.value = value;
          if (!value) {
            onUnmounted(() => {
              dialogInstance.value = null;
            });
          }
        },
      });

      // 确保Dialog实例挂载到DOM后再进行后续操作
      await nextTick();
      dialogInstance.value = instance;
      dialogVisible.value = true;

      return instance;
    } else {
      dialogVisible.value = true; // 改变dialogVisible的状态以打开已存在的Dialog实例
      return dialogInstance.value!;
    }
  }

  function close() {
    if (dialogInstance.value) {
      dialogVisible.value = false; // 改变dialogVisible的状态以关闭Dialog
    }
  }

  return {
    open,
    close,
    dialogVisible,
  };
}
