import Auth from '@/components/home/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getUserInfo, handleLogout } from '@/util/user';
import { LogOutIcon, Menu } from 'lucide-react';
import { useState } from 'react';
import { NavLink, type NavLinkProps } from 'react-router';

/// 网站头部导航

export default function Header() {
  // 获取用户信息
  const { isLogin, username } = getUserInfo();

  const [sheetOpen, setSheetOpen] = useState(false);

  // 导航样式
  const pcLinkClass: NavLinkProps['className'] = ({ isActive }) =>
    `px-2 py-2 text-base transition-all ${isActive ? 'font-bold underline underline-offset-4' : 'text-gray-600 hover:text-gray-900'}`;

  const mobileLinkClass: NavLinkProps['className'] = ({ isActive }) =>
    `block w-full px-3 py-2 text-sm rounded-md transition-all ${
      isActive ? 'font-bold underline underline-offset-4' : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <header className="flex items-center sticky top-0 z-50 h-16 border-b border-border bg-card backdrop-blur-sm px-2 sm:px-4">
      <div className="flex items-center justify-between gap-2 sm:gap-6 w-full">
        {/* Logo */}
        <NavLink to={'/'}>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-md bg-blue-900 text-[15px] font-bold text-white">题</div>
            <span className="font-semibold tracking-tight text-lg hidden sm:inline">开放题库</span>
          </div>
        </NavLink>

        {/* 中等以上屏幕导航 Nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <NavLink to={'question'} className={pcLinkClass}>
            题库中心
          </NavLink>
          <NavLink to={'paper'} className={pcLinkClass}>
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
          <SheetContent side="left" className="w-60 p-0 flex flex-col bg-card">
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
                <NavLink to="/" onClick={() => setSheetOpen(false)} className={mobileLinkClass}>
                  首页
                </NavLink>
                <NavLink to="question" onClick={() => setSheetOpen(false)} className={mobileLinkClass}>
                  题目库
                </NavLink>
                <NavLink to="paper" onClick={() => setSheetOpen(false)} className={mobileLinkClass}>
                  试卷库
                </NavLink>
              </nav>

              {isLogin && (
                <div className="border-t space-y-1">
                  <button
                    onClick={() => {
                      // 退出登录逻辑
                      setSheetOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
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
          <Auth />
        </div>
      </div>
    </header>
  );
}
