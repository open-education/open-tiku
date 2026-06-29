import { FileQuestionMark, LogOutIcon, Menu, ScrollText, Home, BookOpen, FileText, UserRound } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "~/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Login } from "~/user/login";

/// 网站头部导航

function Header() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  // 模拟用户名（实际从你的状态中获取）
  const username = "zhangguangxun1";

  // 用户中心配置
  const userItems = [
    {
      id: 1,
      label: "个人中心",
      icon: <UserRound />,
      url: "/user",
      role: "",
    },
    {
      id: 2,
      label: "我的题目",
      icon: <FileQuestionMark />,
      url: "/user/question/my",
      role: "",
    },
    {
      id: 3,
      label: "我的试卷",
      icon: <ScrollText />,
      url: "/user/paper/my",
      role: "",
    },
  ];

  const closeSheet = () => setSheetOpen(false);
  const openSheet = () => setSheetOpen(true);

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-sm px-2 sm:px-4">
      <div className="h-14 flex items-center justify-between gap-2 sm:gap-6">
        {/* Logo */}
        <NavLink to={"/"}>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs leading-none">题</span>
            </div>
            <span className="font-semibold tracking-tight text-lg hidden sm:inline">开放题库</span>
          </div>
        </NavLink>

        {/* 中等以上屏幕导航 Nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
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

        {/* 移动端菜单按钮 - 仅小屏幕显示 */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0 flex flex-col bg-background">
            <div className="flex flex-col h-full">
              {/* 顶部用户信息 */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  {/* 用昵称首字符作为头像 */}
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{username}</p>
                    <p className="text-xs text-muted-foreground">个人账号</p>
                  </div>
                </div>
              </div>

              {/* 导航菜单 */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <NavLink
                  to="/"
                  onClick={closeSheet}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`
                  }
                >
                  <Home className="h-5 w-5" />
                  首页
                </NavLink>
                <NavLink
                  to="question"
                  onClick={closeSheet}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`
                  }
                >
                  <BookOpen className="h-5 w-5" />
                  题目库
                </NavLink>
                <NavLink
                  to="paper"
                  onClick={closeSheet}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`
                  }
                >
                  <FileText className="h-5 w-5" />
                  精选试卷
                </NavLink>
              </nav>

              {/* 底部辅助功能 */}
              {isLogin && (
                <div className="border-t p-4 space-y-1">
                  {userItems.map(({ id, label, icon, url }) => {
                    return (
                      <NavLink
                        key={id}
                        to={url}
                        onClick={closeSheet}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                      >
                        {icon}
                        {label}
                      </NavLink>
                    );
                  })}

                  <button
                    onClick={() => {
                      // 退出登录逻辑
                      closeSheet();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
                  >
                    <LogOutIcon className="h-5 w-5" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Auth - 右侧用户操作 */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isLogin ? (
            <>
              {/* PC端：显示用户名下拉菜单 */}
              <div className="hidden md:flex items-center gap-1 sm:gap-2 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" className="max-w-75 truncate">
                        {username}
                      </Button>
                    }
                  />
                  <DropdownMenuContent>
                    {userItems.map(({ id, label, icon, url }) => {
                      return (
                        <DropdownMenuItem key={id}>
                          {icon}
                          <NavLink to={url} className="text-sm">
                            {label}
                          </NavLink>
                        </DropdownMenuItem>
                      );
                    })}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem variant="destructive">
                      <LogOutIcon />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* 移动端：显示头像按钮，点击打开Sheet */}
              <Button variant="ghost" size="icon" className="md:hidden rounded-full w-8 h-8 p-0" onClick={openSheet}>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                  {username.charAt(0).toUpperCase()}
                </div>
              </Button>
            </>
          ) : (
            <div>
              {/* 未登录显示登录按钮 - 所有屏幕均显示，但移动端可能更紧凑 */}
              <Popover>
                <PopoverTrigger render={<Button variant="ghost">登录</Button>} />
                <PopoverContent align="start">
                  <PopoverHeader>
                    <PopoverTitle>账号登录</PopoverTitle>
                    <PopoverDescription>为了隐私安全不支持注册, 也不收集除昵称外的任何信息, 作为用户也不要提供任何真实信息</PopoverDescription>
                  </PopoverHeader>
                  <Login />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { Header };
