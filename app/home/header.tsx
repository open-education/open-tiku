import { CheckLine, FileQuestionMark, LogOutIcon, ScrollText, UserIcon } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "~/components/ui/popover";
import { Login } from "~/user/login";

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
          {/* 未登录显示登录按钮 */}
          <div>
            <Popover>
              <PopoverTrigger render={<Button variant="ghost">登录</Button>}></PopoverTrigger>
              <PopoverContent align="start">
                <PopoverHeader>
                  <PopoverTitle>账号登录</PopoverTitle>
                  <PopoverDescription>为了隐私安全不支持注册, 也不收集除昵称外的任何信息, 作为用户也不要提供任何真实信息</PopoverDescription>
                </PopoverHeader>
                <Login />
              </PopoverContent>
            </Popover>
          </div>

          {/* 登录后显示我管理的内容 */}
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <div className="gap-3">
                    <Button variant="ghost">zhangguangxun1</Button>
                  </div>
                }
              />
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <UserIcon />
                  <NavLink to={"user"}>我的学生</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileQuestionMark />
                  <NavLink to={"user"}>我的题目</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ScrollText />
                  <NavLink to={"user"}>我的试卷</NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckLine />
                  <NavLink to={"user"}>我的审核</NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost">
              <NavLink to={"user"}>
                <span className="text-blue-500">个人中心</span>
              </NavLink>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export { Header };
