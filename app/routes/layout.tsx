import { Error } from '@/components/common/error';
import { Logo, MenuList } from '@/components/common/sidebar';
import Auth from '@/components/home/auth';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useUserInfo } from '@/hooks/use-user';
import { checkAccess, filterMenuItems, getMenuMap } from '@/util/menu';
import { finalUserLogin } from '@/util/user';
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

// 网站布局样式

export default function Layout() {
  // 用户登录临时 token 换票
  const navigate = useNavigate();

  useEffect(() => {
    finalUserLogin(navigate);
  }, []);

  const location = useLocation();
  const currentPath = location.pathname;

  const menuMap = useMemo(() => {
    return getMenuMap();
  }, []);

  // 登录用户信息
  const user = useUserInfo();

  // 根据登录信息和角色等过滤后剩余的菜单项
  const finalMenuItems = useMemo(() => {
    return filterMenuItems(user);
  }, [user]);

  // 当前菜单项目
  const currentMenu = menuMap[currentPath] || null;
  if (!checkAccess(user, currentMenu)) {
    return <Error message="401" details="你没有权限访问这些内容" />;
  }

  return (
    <SidebarProvider className="animate-in fade-in duration-150">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>

        <Separator />

        <SidebarContent>
          <MenuList menuItems={finalMenuItems} currentPath={currentPath} />
        </SidebarContent>

        <SidebarFooter>
          <SidebarTrigger className="-ml-1" />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex shrink-0 items-center justify-between gap-2 bg-card py-2 pr-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-10">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex h-4 items-center mr-2">
              <Separator orientation="vertical" className="h-full" />
            </div>
            <div className="text-sm">{currentMenu?.title || ''}</div>
          </div>

          <div className="flex items-center">
            <Auth />
          </div>
        </header>

        <div className="p-3 bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
