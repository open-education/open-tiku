import { createPortal } from "react-dom";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";

/// 加载中提示

// 直接使用 Portal 挂载到 body，摆脱父容器样式影响, 需要确保 document 存在方可挂载
function Loading() {
  return createPortal(
    <div className="fixed inset-0 z-100 grid place-items-center bg-black/50 backdrop-blur-sm pointer-events-auto">
      <div className="px-6 py-3 rounded-lg bg-background shadow-lg border">
        <Button variant="ghost" disabled className="gap-2">
          <Spinner className="size-8 animate-spin text-blue-500" />
          <span className="text-blue-500">Please wait...</span>
        </Button>
      </div>
    </div>,
    document.body,
  );
}

export { Loading };
