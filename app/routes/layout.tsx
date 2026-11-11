import { Outlet } from 'react-router';
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
import { Separator } from '@/components/ui/separator';
import { Logo, MenuList } from '@/common/sidebar';

// 网站布局样式

export default function Layout() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>

        <Separator />

        <SidebarContent>
          <MenuList />
        </SidebarContent>

        <SidebarFooter>
          <SidebarTrigger className="-ml-1" />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex shrink-0 items-center justify-between gap-2 bg-card py-4 pr-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex h-4 items-center mr-2">
              <Separator orientation="vertical" className="h-full" />
            </div>
            <div className="leading-none">面包屑, 登录信息等</div>
          </div>

          <div className="flex items-center">
            <div>用户信息</div>
          </div>
        </header>

        <div className="p-3 bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
