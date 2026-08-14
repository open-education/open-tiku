import { ArrowRight, FileQuestionMark, FileText, House } from "lucide-react";
import type React from "react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";

// 错误页面

interface ErrorProps {
  message: string;
  details: string;
  stack: string | undefined;
}

// 链接属性
interface LinkProps {
  id: number;
  title: string;
  href: string;
  leftIcon: React.ElementType;
  rightIcon: React.ElementType;
}

function Error({ message, details, stack }: ErrorProps) {
  // 主要退回导航
  const mainNavLinks: LinkProps[] = [
    {
      id: 1,
      title: "返回首页",
      href: "/",
      leftIcon: House,
      rightIcon: ArrowRight,
    },
  ];

  // 次要连接导航
  const secondNavLinks: LinkProps[] = [
    {
      id: 1,
      title: "题目库",
      href: "/question",
      leftIcon: FileQuestionMark,
      rightIcon: ArrowRight,
    },
    {
      id: 2,
      title: "试卷库",
      href: "/paper",
      leftIcon: FileText,
      rightIcon: ArrowRight,
    },
  ];

  return (
    <section className="py-16 md:py-24 w-full">
      <div className="mx-auto max-w-2xl px-4 text-center md:px-6">
        <p className="text-7xl font-bold tracking-tight text-muted-foreground md:text-8xl">{message}</p>
        <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight md:text-4xl">{details}</h1>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}

        {/* 主要返回导航 */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {mainNavLinks.map((item) => {
            return (
              <NavLink key={item.id} to={item.href}>
                <Button size="lg" className="w-40 text-sm">
                  <item.leftIcon />
                  {item.title}
                  <item.rightIcon />
                </Button>
              </NavLink>
            );
          })}
        </div>

        {/* 次要访问导航 */}
        <div className="mt-12 border-t pt-8">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">试着浏览这些有效的链接: </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {secondNavLinks.map((item) => {
              return (
                <NavLink
                  key={item.id}
                  to={item.href}
                  className="group/error1 inline-flex items-center gap-1.5 text-base font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  <Button variant="secondary" className="w-30">
                    <item.leftIcon />
                    {item.title}
                    <item.rightIcon className="size-4 transition-transform group-hover/error1:translate-x-0.5" />
                  </Button>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export { Error };
