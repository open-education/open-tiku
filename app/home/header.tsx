import { FileText } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";

/// 网站头部导航

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm pl-4 pr-4">
      <div className="h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <NavLink to={"/"}>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs leading-none">题</span>
            </div>
            <span className="font-semibold tracking-tight text-lg">开放题库</span>
          </div>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          <NavLink to={"question"}>
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "link"}>
                <span className="text-base">题目库</span>
              </Button>
            )}
          </NavLink>
          <NavLink to={"paper"}>
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "link"}>
                <span className="text-base flex gap-1">精选试卷</span>
              </Button>
            )}
          </NavLink>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm">
            登录
          </Button>
        </div>
      </div>
    </header>
  );
}

export { Header };
