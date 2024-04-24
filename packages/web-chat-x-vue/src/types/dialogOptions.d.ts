import { ExtractPropTypes } from "vue";
import { ElDialog as _ElDialog } from "element-plus";

type DialogOptions = ExtractPropTypes<(typeof _ElDialog)["props"]>;

interface DialogProps {
  initialOptions: DialogOptions;
}
