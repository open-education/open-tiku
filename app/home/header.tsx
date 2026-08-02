import { LogOutIcon, Menu, UserKey } from "lucide-react";
import { useState } from "react";
import { NavLink, type NavLinkProps } from "react-router";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "~/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { useUser } from "~/hooks/use-user";
import type { UserInfoResp } from "~/type/user";
import { Login } from "~/user/login";
import { httpClient } from "~/util/http";

/// 网站头部导航

function Header() {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUser();

  const isLogin = currentUser && currentUser?.userId > 0;
  const [sheetOpen, setSheetOpen] = useState(false);

  // 实际从你的状态中获取
  const username = currentUser?.email || currentUser?.username || "";

  // 用户中心配置
  const userItems = [
    {
      id: 1,
      label: "我的题目",
      url: "/user/question/my",
      role: "",
    },
    {
      id: 2,
      label: "我的审核",
      url: "/user/question/review",
      role: "",
    },
  ];

  const closeSheet = () => setSheetOpen(false);
  const openSheet = () => setSheetOpen(true);

  // 退出登录
  const handleLogout = () => {
    httpClient
      .get<boolean>("/user/logout")
      .then(() => {
        window.dispatchEvent(new Event("user-update"));
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      });
  };

  // 导航样式
  const pcLinkClass: NavLinkProps["className"] = ({ isActive }) =>
    `px-2 py-2 text-base transition-all ${isActive ? "font-bold underline underline-offset-4" : "text-gray-600 hover:text-gray-900"}`;

  const mobileLinkClass: NavLinkProps["className"] = ({ isActive }) =>
    `block w-full px-3 py-2 text-sm rounded-md transition-all ${
      isActive ? "font-bold underline underline-offset-4" : "text-gray-600 hover:text-gray-900"
    }`;

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
          <NavLink to={"question"} className={pcLinkClass}>
            题目库
          </NavLink>
          <NavLink to={"paper"} className={pcLinkClass}>
            试卷库
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
              <nav className="p-4 space-y-1 overflow-y-auto">
                <NavLink to="/" onClick={closeSheet} className={mobileLinkClass}>
                  首页
                </NavLink>
                <NavLink to="question" onClick={closeSheet} className={mobileLinkClass}>
                  题目库
                </NavLink>
                <NavLink to="paper" onClick={closeSheet} className={mobileLinkClass}>
                  试卷库
                </NavLink>
              </nav>

              {/* 底部辅助功能 */}
              {isLogin && (
                <div className="border-t p-4 space-y-1">
                  {userItems.map(({ id, label, url }) => {
                    return (
                      <NavLink key={id} to={url} onClick={closeSheet} className={mobileLinkClass}>
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
                  <DropdownMenuContent className="min-w-8 px-2 py-2">
                    {userItems.map(({ id, label, url }) => {
                      return (
                        <DropdownMenuItem key={id}>
                          <NavLink to={url} className="text-sm">
                            {label}
                          </NavLink>
                        </DropdownMenuItem>
                      );
                    })}

                    <DropdownMenuSeparator className="mt-2 mb-2" />

                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
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
                <PopoverTrigger
                  render={
                    <Button variant="ghost" className="text-sm">
                      <UserKey />
                      账户登录
                    </Button>
                  }
                />
                <PopoverContent align="start">
                  <PopoverHeader>
                    <PopoverTitle className="text-base font-bold">账号登录</PopoverTitle>
                    <PopoverDescription className="text-sm">不支持注册, 也不收集除昵称外的任何信息, 用户也不要提供任何真实信息</PopoverDescription>
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
