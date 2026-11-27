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
import { useCurrentMenu } from '@/hooks/use-current-menu';
import { Outlet } from 'react-router';
import type { Route } from './+types/main';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的业务空间' },
    {
      name: 'description',
      content: '管理网信息配置，我的题目和试卷',
    },
  ];
}

// 网站布局样式

export default function Main() {
  const { currentPath, finalMenuItems, currentMenu } = useCurrentMenu();

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
