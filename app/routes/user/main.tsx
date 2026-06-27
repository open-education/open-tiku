import type { Route } from "./+types/main";
import { BookA, BookOpenText, CheckCheck, ChevronRight, ChevronsUpDown, FileQuestionMark, House, LogOut, ScrollText, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { NavLink, Outlet, useLocation } from "react-router";
import { Button } from "~/components/ui/button";

// 个人中心首页

/// 网站首页顶部和底部框架
export function meta({}: Route.MetaArgs) {
  return [
    { title: "个人中心" },
    {
      name: "description",
      content: "作为作者，管理我上传的题目和试卷；作为老师，负责审核其他人上传和修改的题目和试卷; 建立自己的班级并管理学生; 管理网站基础配置等.",
    },
  ];
}

// 配置导航菜单
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  url: string; // 这个路径仅仅是记录匹配当前选中的位置, 不做跳转
  children?: NavItem[];
}

const defaultItems: NavItem[] = [
  {
    id: "settings",
    label: "系统设置",
    icon: Settings,
    url: "/user/setting",
    children: [
      { id: "setting-textbook", label: "章节/考点", icon: BookOpenText, url: "/user/setting/textbook" },
      { id: "setting-dict", label: "通用字典", icon: BookA, url: "/user/setting/dict" },
    ],
  },
  {
    id: "questions",
    label: "题目",
    icon: FileQuestionMark,
    url: "/user/question",
    children: [
      {
        id: "myQuestion",
        label: "我的题目",
        icon: FileQuestionMark,
        url: "/user/question/my",
      },
      {
        id: "myReview",
        label: "我的审核",
        icon: CheckCheck,
        url: "/user/question/review",
      },
    ],
  },
];

// 快速得到面包屑条的字典
const defaultBreadcrumbMap: Record<string, string[]> = {
  "/user/setting/textbook": ["系统设置", "章节/考点"],
  "/user/setting/dict": ["系统设置", "通用字典"],
  "/user/question/my": ["题目", "我的题目"],
  "/user/question/review": ["题目", "我的审核"],
};

// 个人中心布局首页
export default function Index() {
  const location = useLocation();
  const pathname = location.pathname;

  // 计算当前前2级地址信息 /user/setting/dict -> /user/setting
  const curUrl = pathname.split("/").slice(0, 3).join("/");

  return (
    <SidebarProvider>
      {/* 左侧菜单 */}
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <UserHeader />
        </SidebarHeader>

        <SidebarContent>
          <UserSidebarMenu items={defaultItems} curUrl={curUrl} />
        </SidebarContent>

        <SidebarFooter>
          <UserFooter />
        </SidebarFooter>
      </Sidebar>

      {/* 内容体 */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            {/* 展开收起侧边栏 */}
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-6" />
            {/* 面包屑 */}
            <UserBreadcrumb labels={defaultBreadcrumbMap[pathname] || []} />
          </div>
        </header>

        {/* 业务内容 */}
        <div className="text-base px-4 pt-3 sm:px-16 sm:pt-4 min-h-screen flex-1 bg-muted/50 md:min-h-minflex">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// 用户中心头布局
function UserHeader() {
  const { isMobile } = useSidebar();

  // 快捷跳转回网站主页
  const items: NavItem[] = [
    {
      id: "home",
      label: "首页",
      icon: House,
      url: "/",
    },
    {
      id: "question",
      label: "题目库",
      icon: FileQuestionMark,
      url: "/question",
    },
    {
      id: "paper",
      label: "精选试卷",
      icon: ScrollText,
      url: "/paper",
    },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <House className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-base font-bold">个人中心</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {/* 用普通 div 替代 DropdownMenuLabel，避免 Base UI 的组上下文要求 */}
            <div className="text-sm text-muted-foreground px-2 py-1.5">开放题目</div>

            {items.map((info) => {
              return (
                <NavLink to={info.url}>
                  <DropdownMenuItem key={info.id} className="gap-2 p-2 text-sm">
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <info.icon className="size-3.5 shrink-0" />
                    </div>
                    {info.label}
                  </DropdownMenuItem>
                </NavLink>
              );
            })}
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// 用户中心侧边栏菜单
interface UserSidebarMenuProps {
  curUrl: string;
  items: NavItem[];
}
function UserSidebarMenu({ items, curUrl }: UserSidebarMenuProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-base font-medium">平台</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.label}
            defaultOpen={item.url === curUrl}
            className="group/collapsible"
            render={
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton tooltip={item.label}>
                      {item.icon && <item.icon />}
                      <span className="text-sm">{item.label}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  }
                />
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <nav className="hidden md:flex items-center gap-1 flex-1">
                      {item.children?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.id}>
                          <SidebarMenuSubButton
                            render={
                              <NavLink to={subItem.url}>
                                {({ isActive }) => (
                                  <Button className="text-sm" variant={isActive ? "default" : "link"}>
                                    {subItem.label}
                                  </Button>
                                )}
                              </NavLink>
                            }
                          />
                        </SidebarMenuSubItem>
                      ))}
                    </nav>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            }
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// 用户中心底部用户信息
function UserFooter() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{Array.from("zhangguangxun1")[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">zhangguangxun1</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* 用普通 div 替代 DropdownMenuLabel，避免 Base UI 的组上下文要求 */}
            <div className="text-xs text-muted-foreground px-2 py-1.5">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{Array.from("zhangguangxun1")[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">zhangguangxun1</span>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// 菜单选择面包屑
interface UserBreadcrumbProps {
  labels: string[];
}
function UserBreadcrumb({ labels }: UserBreadcrumbProps) {
  if (labels.length <= 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {labels.map((label, index) => {
          const isLast = index === labels.length - 1;
          return (
            <>
              <BreadcrumbItem className={!isLast ? "hidden md:block" : ""}>
                {isLast ? <BreadcrumbPage>{label}</BreadcrumbPage> : <BreadcrumbLink href="#">{label}</BreadcrumbLink>}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
