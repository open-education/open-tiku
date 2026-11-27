import Auth from '@/components/home/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserInfo } from '@/hooks/use-user';
import { UserRoleType } from '@/type/enum';
import { getUserInfo, handleLogout } from '@/util/user';
import { cn } from 'cn';
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
    { key: 'student', url: '/student', label: '我的工作台' },
    { key: 'student-homework', url: '/student/homework', label: '我的作业' },
  ],
  [UserRoleType.Teacher]: [
    { key: 'ops-my', url: '/ops', label: '我的工作台' },
    { key: 'ops-my-question', url: '/ops/my/question', label: '我的题目' },
    { key: 'ops-my-paper', url: '/ops/my/paper', label: '我的试卷' },
    { key: 'ops-class', url: '/ops/class', label: '我的班级' },
  ],
};

export default function Header() {
  const userInfo = useUserInfo();
  const { isLogin, username } = getUserInfo();
  const [sheetOpen, setSheetOpen] = useState(false);

  const pcLinkClass: NavLinkProps['className'] = ({ isActive }) =>
    `px-2 py-2 text-base transition-all ${isActive ? 'font-bold underline underline-offset-4' : 'text-gray-600 hover:text-gray-900'}`;
  const pcLinkRoleClass: NavLinkProps['className'] = ({ isActive }) =>
    `px-2 py-2 text-sm transition-all ${isActive ? 'font-bold underline underline-offset-4' : 'text-gray-600 hover:text-gray-900'}`;

  const mobileLinkClass: NavLinkProps['className'] = ({ isActive }) =>
    `block w-full px-3 py-2 text-sm rounded-md transition-all ${
      isActive ? 'font-bold underline underline-offset-4' : 'text-gray-600 hover:text-gray-900'
    }`;

  // 仅保留角色专属菜单，与系统菜单分开渲染
  const roleMenuItems: SystemMenuItem[] = useMemo(() => {
    if (!userInfo || userInfo.userId <= 0) return [];
    return defaultRoleMenuMap[userInfo.role] ?? [];
  }, [userInfo]);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur-sm px-4">
      <div className="flex items-center justify-between gap-4 w-full h-full">
        {/* 左侧：Logo + 公共系统菜单 */}
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-900 text-sm font-bold text-white">题</div>
            <span className="font-semibold tracking-tight text-lg hidden sm:inline">开放题库</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {defaultSystemMenuItems.map((item) => (
              <NavLink key={item.key} to={item.url} end className={pcLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* 右侧：角色专属快捷区 + 用户头像 */}
        <div className="flex items-center gap-2 shrink-0">
          {roleMenuItems.length > 0 && (
            <nav className="hidden lg:flex items-center gap-1 mr-2 pr-3 border-r border-border">
              {roleMenuItems.map((item) => (
                <NavLink key={item.key} to={item.url} end className={pcLinkRoleClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* 移动端菜单按钮 */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64 p-0 flex flex-col bg-card">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 p-4 border-b">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {username?.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium text-sm truncate">{username}</p>
                </div>

                <nav className="p-3 space-y-4 overflow-y-auto flex-1">
                  <div className="space-y-1">
                    <p className="px-3 text-xs font-medium">浏览</p>
                    <NavLink to="/" end onClick={() => setSheetOpen(false)} className={mobileLinkClass}>
                      首页
                    </NavLink>
                    {defaultSystemMenuItems.map((item) => (
                      <NavLink key={item.key} to={item.url} end onClick={() => setSheetOpen(false)} className={mobileLinkClass}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>

                  {roleMenuItems.length > 0 && (
                    <div className="space-y-1 pt-3 border-t border-border">
                      <p className="px-3 text-xs font-medium">个人中心</p>
                      {roleMenuItems.map((item) => (
                        <NavLink key={item.key} to={item.url} end onClick={() => setSheetOpen(false)} className={mobileLinkClass}>
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </nav>

                {isLogin && (
                  <div className="p-3 border-t">
                    <button
                      onClick={() => {
                        setSheetOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full"
                    >
                      <LogOutIcon className="h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Auth />
        </div>
      </div>
    </header>
  );
}
