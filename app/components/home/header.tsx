import Auth from '@/components/home/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserInfo } from '@/hooks/use-user';
import { UserRoleType } from '@/type/enum';
import { getUserInfo, handleLogout } from '@/util/user';
import { LogOutIcon, Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, type NavLinkProps } from 'react-router';

/// 网站头部导航

// 菜单属性
interface SystemMenuItem {
  key: string;
  url: string;
  label: string;
}

// 系统菜单
const defaultSystemMenuItems: SystemMenuItem[] = [
  { key: 'question', url: '/question', label: '题库中心' },
  { key: 'question-paper', url: '/question/paper', label: '试卷库' },
];

// 各角色专属菜单映射表
const defaultRoleMenuMap: Record<number, SystemMenuItem[]> = {
  [UserRoleType.Student]: [
    { key: 'student', url: '/student', label: '学习首页' },
    { key: 'homework', url: '/student/homework', label: '我的作业' },
  ],
  [UserRoleType.Teacher]: [{ key: 'ops', url: '/ops', label: '工作台' }],
};

export default function Header() {
  // 获取用户信息
  const userInfo = useUserInfo();

  const { isLogin, username } = getUserInfo();

  const [sheetOpen, setSheetOpen] = useState(false);

  // 导航样式
  const pcLinkClass: NavLinkProps['className'] = ({ isActive }) =>
    `px-2 py-2 text-base transition-all ${isActive ? 'font-bold underline underline-offset-4' : 'text-gray-600 hover:text-gray-900'}`;

  const mobileLinkClass: NavLinkProps['className'] = ({ isActive }) =>
    `block w-full px-3 py-2 text-sm rounded-md transition-all ${
      isActive ? 'font-bold underline underline-offset-4' : 'text-gray-600 hover:text-gray-900'
    }`;

  // 导航菜单
  const menuItems: SystemMenuItem[] = useMemo(() => {
    if (!userInfo || userInfo.userId <= 0) {
      return defaultSystemMenuItems;
    }

    const roleSpecificMenus = defaultRoleMenuMap[userInfo.role] ?? [];

    return [...defaultSystemMenuItems, ...roleSpecificMenus];
  }, [userInfo]);

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
          {menuItems.map((item) => {
            return (
              <NavLink key={item.key} to={item.url} end className={pcLinkClass}>
                {item.label}
              </NavLink>
            );
          })}
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
                <NavLink key="homepage" to="/" end onClick={() => setSheetOpen(false)} className={mobileLinkClass}>
                  首页
                </NavLink>
                {menuItems.map((item) => {
                  return (
                    <NavLink key={item.key} to={item.url} end className={mobileLinkClass}>
                      {item.label}
                    </NavLink>
                  );
                })}
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
