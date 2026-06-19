import { FileText } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";

/// 网站头部导航

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <NavLink to={"/"}>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs leading-none">数</span>
            </div>
            <span className="font-semibold tracking-tight text-[15px]">数题库</span>
          </div>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          <Button variant="ghost" size="sm">
            <NavLink to={"question"}>题目库</NavLink>
          </Button>
          <Button variant="ghost" size="sm">
            <FileText size={13} />
            <NavLink to={"paper"}>精选试卷</NavLink>
          </Button>
          <Button variant="ghost" size="sm">
            <NavLink to={""}>关于</NavLink>
          </Button>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm">
            登录
          </Button>
          <Button size="sm">免费注册</Button>
        </div>
      </div>
    </header>
  );
}

export { Header };
