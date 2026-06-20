import { Button } from "~/components/ui/button";

/// 网站底部导航和说明信息

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-[10px]">题</span>
          </div>
          <span>开放题库 © 2024</span>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <a href="#">使用条款</a>
          </Button>
          <Button variant="ghost" size="sm">
            <a href="#">隐私政策</a>
          </Button>
          <Button variant="ghost" size="sm">
            <a href="#">联系我们</a>
          </Button>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
