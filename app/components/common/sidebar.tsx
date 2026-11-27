import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { OpsMenu } from '@/type/menu';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

// 用户中心菜单项

// 顶部Logo
function Logo() {
  return (
    <Link to={'/'}>
      <div
        className="
            flex items-center gap-3 overflow-hidden
            transition-all duration-200
            group-data-[collapsible=icon]:justify-center
            group-data-[collapsible=icon]:gap-0
            group-data-[collapsible=icon]:px-0
          "
      >
        {/* Logo */}
        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-md bg-blue-900 text-[15px] font-bold text-white">题</div>

        {/* 文字块: 收缩时宽度归零 + 淡出, 保持动画平滑 */}
        <div
          className="
              min-w-0 overflow-hidden whitespace-nowrap
              transition-[width,opacity] duration-200
              group-data-[collapsible=icon]:w-0
              group-data-[collapsible=icon]:opacity-0
            "
        >
          <div className="text-base font-bold tracking-wide">开放题库</div>
          <div className="mt-0.5 text-[11px] tracking-[1px] opacity-60">公益 · 共建 · 开放</div>
        </div>
      </div>
    </Link>
  );
}

interface MenuListProps {
  menuItems: OpsMenu[];
  currentPath: string;
}
function MenuList({ menuItems, currentPath }: MenuListProps) {
  // 判断某个 url 是否为当前激活项
  const isActive = (url?: string) => {
    if (!url) return false;
    return currentPath === url;
  };

  // 受控的折叠状态
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // 路由变化时, 自动展开包含当前路由的分组
  useEffect(() => {
    const activeItem = menuItems.find((item) => item.items?.some((sub) => isActive(sub.url)));

    if (activeItem) {
      setOpenGroups((prev) => ({
        ...prev,
        [activeItem.key]: true,
      }));
    }
  }, [currentPath, menuItems]);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {menuItems.map((item) => {
          // 没有子项的菜单直接渲染
          if (!item.items) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  className="text-sm"
                  render={
                    <Link to={item.url!}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            );
          }

          // 有子项的菜单：用 Collapsible 包裹
          return (
            <Collapsible
              key={item.title}
              open={openGroups[item.key] ?? false}
              onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [item.key]: open }))}
              className="group/collapsible"
              render={
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton tooltip={item.title} className="text-sm">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    }
                  />
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={isActive(subItem.url)}
                            render={
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            }
                          />
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              }
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export { Logo, MenuList };
