<template>
  <el-dialog
    :model-value="dialogVisible"
    @update:model-value="handleDialogVisibleChange"
    :title="dialogOptions.title"
    :width="dialogOptions.width"
  >
    <slot></slot>
    <!-- 这里放置你的Dialog内容 -->
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive } from "vue";
import useDialog from "@/hooks/useDialog";
import { DialogOptions } from "@/types/dialogOptions";

export default defineComponent({
  name: "CustomDialog",
  props: {
    initialOptions: {
      type: Object as PropType<DialogOptions>,
      required: true,
    },
  },
  setup(props) {
    const dialogOptions = reactive({ ...props.initialOptions });
    const { dialogVisible, open, close } = useDialog();

    // 初始化打开对话框
    open(dialogOptions);

    function handleDialogVisibleChange(value: boolean) {
      if (!value) {
        close();
      }
    }

    return {
      dialogVisible,
      dialogOptions,
      handleDialogVisibleChange,
      // 提供一个更新dialogOptions的方法给父组件调用
      updateDialogOptions(newOptions: DialogOptions) {
        Object.assign(dialogOptions, newOptions);
      },
    };
  },
});
</script>
