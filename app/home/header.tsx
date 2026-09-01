import { ArrowRight, BarChart3, BookX, FileQuestionMark, FileText, LogOutIcon, Menu, School, Settings, SquarePen, UserKey } from "lucide-react";
import React, { useState } from "react";
import { NavLink, type NavLinkProps } from "react-router";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "~/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { useUserInfo } from "~/hooks/use-user";
import { UserRoleType } from "~/type/enum";
import type { UserInfoResp } from "~/type/user";
import { Login } from "~/user/login";
import { httpClient } from "~/util/http";

/// 网站头部导航

interface LinkProps {
  id: number;
  label: string;
  url: string;
  leftIcon: React.ElementType;
  rightIcon: React.ElementType;
}

// 教师用户中心配置
const teacherUserItems: LinkProps[] = [
  {
    id: 1,
    label: "教材章节/考点",
    url: "/user/setting/textbook",
    leftIcon: Settings,
    rightIcon: ArrowRight,
  },
  {
    id: 2,
    label: "我的题目",
    url: "/user/question/my",
    leftIcon: FileQuestionMark,
    rightIcon: ArrowRight,
  },
  {
    id: 3,
    label: "我的试卷",
    url: "/user/paper/my",
    leftIcon: FileText,
    rightIcon: ArrowRight,
  },
  {
    id: 4,
    label: "我的班级",
    url: "/user/class/my",
    leftIcon: School,
    rightIcon: ArrowRight,
  },
];

// 学生用户中心配置
const studentUserItems: LinkProps[] = [
  {
    id: 1,
    label: "开始练习",
    url: "/test",
    leftIcon: SquarePen,
    rightIcon: ArrowRight,
  },
  {
    id: 2,
    label: "错题本",
    url: "",
    leftIcon: BookX,
    rightIcon: ArrowRight,
  },
  {
    id: 3,
    label: "我的学情",
    url: "",
    leftIcon: BarChart3,
    rightIcon: ArrowRight,
  },
];

function Header() {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUserInfo();

  const isLogin = currentUser && currentUser?.userId > 0;
  const [sheetOpen, setSheetOpen] = useState(false);

  // 实际从你的状态中获取
  const username = currentUser?.email || currentUser?.username || "";

  // 根据用户角色获取当前展示菜单
  const get_current_items = () => {
    if (!isLogin) {
      return [];
    }

    if (currentUser.role === UserRoleType.Teacher) {
      return teacherUserItems;
    }

    if (currentUser.role === UserRoleType.Student) {
      return studentUserItems;
    }

    return [];
  };

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
    <header className="flex items-center sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-sm px-2 sm:px-4">
      <div className="flex items-center justify-between gap-2 sm:gap-6 w-full">
        {/* Logo */}
        <NavLink to={"/"}>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-12 h-12 rounded flex items-center justify-center">
              <img src="/logo.png" />
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
          <SheetContent side="left" className="w-60 p-0 flex flex-col bg-background">
            <div className="flex flex-col h-full">
              {/* 顶部用户信息 */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{username}</p>
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

              {/* 底部辅助功能 - 使用 NavLink 代替 DropdownMenuItem */}
              {isLogin && (
                <div className="border-t p-4 space-y-1">
                  {get_current_items().map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.url}
                      onClick={closeSheet}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors text-gray-600 hover:text-gray-900 hover:bg-accent"
                    >
                      <item.leftIcon className="w-4.5 shrink-0" />
                      {item.label}
                      <item.rightIcon className="ml-auto" />
                    </NavLink>
                  ))}

                  <button
                    onClick={() => {
                      // 退出登录逻辑
                      closeSheet();
                      handleLogout();
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
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-xs leading-none">{username.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-blue-700 text-base">{username}</span> <span>已登录</span>
                        </div>
                      </Button>
                    }
                  />
                  <DropdownMenuContent className="px-8 py-4 w-60">
                    {get_current_items().map((item) => (
                      <DropdownMenuItem key={item.id}>
                        <NavLink to={item.url} className="text-sm flex items-center gap-4 w-full">
                          <item.leftIcon className="w-4.5 shrink-0" />
                          {item.label}
                          <item.rightIcon className="ml-auto" />
                        </NavLink>
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="mt-2 mb-2" />

                    <DropdownMenuItem variant="destructive" onClick={handleLogout} className="text-sm">
                      <LogOutIcon />
                      退出登录
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
