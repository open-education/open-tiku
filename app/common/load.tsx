import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";

// 加载中提示
function Loading() {
  return (
    <div className="fixed inset-0 grid place-items-center pointer-events-none">
      <div className="px-6 py-3 rounded-lg pointer-events-auto">
        <Button variant="ghost" disabled>
          <Spinner className="size-8" />
          Please wait...
        </Button>
      </div>
    </div>
  );
}

export { Loading };
