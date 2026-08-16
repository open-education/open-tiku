import { NavLink, Outlet, useLocation } from "react-router";
import type { Route } from "./+types/main";
import { BookA, BookOpenText, ChevronDown, CircleCheckBig, FileQuestionMark, FileText, Link, Menu, School, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { useUserInfo } from "~/hooks/use-user";
import { UserRoleType } from "~/type/enum";

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
  href: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: "settings",
    label: "系统设置",
    icon: Settings,
    href: "",
    children: [
      { id: "setting-textbook", label: "章节/考点", icon: BookOpenText, href: "/user/setting/textbook" },
      { id: "setting-ck", label: "挂载题型", icon: Link, href: "/user/setting/ck" },
      { id: "setting-dict", label: "通用字典", icon: BookA, href: "/user/setting/dict" },
    ],
  },
  {
    id: "questions",
    label: "题目",
    icon: FileQuestionMark,
    href: "",
    children: [
      {
        id: "myQuestion",
        label: "我的题目",
        icon: FileQuestionMark,
        href: "/user/question/my",
      },
      {
        id: "myReview",
        label: "我的审核",
        icon: CircleCheckBig,
        href: "/user/question/review",
      },
    ],
  },
  {
    id: "papers",
    label: "试卷",
    icon: FileText,
    href: "",
    children: [
      {
        id: "myPaper",
        label: "我的试卷",
        icon: FileText,
        href: "/user/paper/my",
      },
      {
        id: "myPaperReview",
        label: "我的审核",
        icon: CircleCheckBig,
        href: "/user/paper/review",
      },
    ],
  },
  {
    id: "classes",
    label: "班级",
    icon: School,
    href: "",
    children: [
      {
        id: "myClasses",
        label: "我的班级",
        icon: School,
        href: "/user/class/my",
      },
    ],
  },
];

// 记录路径对应的父级id, 用于首次访问展开父级菜单
const navigationItemMap: Record<string, string> = {};
navigationItems.forEach((item) => {
  (item.children ?? []).forEach((child) => {
    navigationItemMap[child.href] = item.id;
  });
});

// 个人中心布局首页
export default function Index() {
  // 未登录用户不渲染任何子页面
  const currentUser = useUserInfo();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // 记录需要展开的菜单标识 /user/question/my
  const location = useLocation();
  const [expandedNavItems, setExpandedNavItems] = useState<Set<string>>(() => {
    const set = new Set<string>();
    const parentId = navigationItemMap[location.pathname];
    if (parentId) set.add(parentId);
    return set;
  });

  // 依赖路径变化时看是否要展开菜单
  useEffect(() => {
    const parentId = navigationItemMap[location.pathname];
    if (parentId) {
      setExpandedNavItems((prev) => {
        // 如果已经展开，保持不变，避免不必要的重新渲染
        if (prev.has(parentId)) return prev;
        const next = new Set(prev);
        next.add(parentId);
        return next;
      });
    }
  }, [location.pathname]);

  // 检测是否为桌面端
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768); // md 断点
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // 切换导航项展开/收起（仅用于有子菜单的项）
  const toggleNavExpand = (id: string) => {
    setExpandedNavItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 关闭移动端菜单
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // 递归渲染导航项
  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = !!item.children?.length;
    const isExpanded = expandedNavItems.has(item.id);

    if (hasChildren) {
      return (
        <div key={item.id} className="w-full">
          <button
            onClick={() => toggleNavExpand(item.id)}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all",
              "hover:bg-accent hover:text-accent-foreground",
              "text-muted-foreground",
              depth > 0 && "pl-8",
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
          </button>
          {isExpanded && <div className="mt-0.5 space-y-0.5">{item.children!.map((child) => renderNavItem(child, depth + 1))}</div>}
        </div>
      );
    }

    // 叶子节点：使用 NavLink
    return (
      <NavLink
        key={item.id}
        to={item.href}
        onClick={closeMobileMenu}
        className={({ isActive }) =>
          cn(
            "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all",
            "hover:bg-accent hover:text-accent-foreground",
            isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground",
            depth > 0 && "pl-8",
          )
        }
      >
        <item.icon className="h-4.5 w-4.5 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
      </NavLink>
    );
  };

  const navContent = <nav className="flex flex-col gap-1 p-3">{navigationItems.map((item) => renderNavItem(item))}</nav>;

  // ----- 桌面端布局 -----
  if (isDesktop) {
    return (
      <div className="flex h-full text-base">
        {currentUser && (
          <>
            <aside className="flex w-64 flex-col border bg-background/95">
              <ScrollArea className="flex-1">
                <div className="py-2">{navContent}</div>
              </ScrollArea>
            </aside>
            <main className="flex-1 overflow-auto bg-muted/30">
              <div className="mx-auto">
                <Outlet />
              </div>
            </main>
          </>
        )}
      </div>
    );
  }

  // ----- 移动端布局 -----
  return (
    <div className="flex flex-col h-full text-base">
      {currentUser && currentUser.role === UserRoleType.Teacher && (
        <>
          {/* 顶部导航栏（汉堡按钮 + 标题） */}
          <div className="sticky top-0 z-20 border bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-3 px-4 py-2.5">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <span className="text-sm font-semibold">导航</span>
            </div>
            {/* 展开的菜单（推动内容下移） */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isMobileMenuOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0",
              )}
            >
              <ScrollArea className="max-h-[calc(70vh-56px)]">
                <div className="px-2 py-1">{navContent}</div>
              </ScrollArea>
            </div>
          </div>

          {/* 内容区域 */}
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="mx-auto">
              <Outlet />
            </div>
          </main>

          {/* 遮罩层（点击关闭） */}
          {isMobileMenuOpen && <div className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm" onClick={closeMobileMenu} />}
        </>
      )}
    </div>
  );
}
