// 网站脚部信息

import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

// 配置链接信息
interface LinkItemProps {
  title: string;
  href: string;
  target: string;
}
interface LinksProps {
  title: string;
  items: LinkItemProps[];
}

const links: LinksProps[] = [
  {
    title: "关于我们",
    items: [{ title: "加入我们", href: "https://oef.org.cn/about/join/", target: "_blank" }],
  },
  {
    title: "帮助文档",
    items: [],
  },
  {
    title: "常见问题",
    items: [
      {
        title: "FAQs",
        href: "faqs",
        target: "_self",
      },
    ],
  },
  {
    title: "友情链接",
    items: [{ title: "开放教育反应堆", href: "https://oef.org.cn", target: "_blank" }],
  },
];

function Footer() {
  return (
    <footer className="bg-white px-8 py-4">
      <div className="mb-4">
        <Separator />
      </div>

      <div className="w-full">
        {/* 上部：描述信息与链接列表两端对齐 */}
        <div className="flex flex-wrap justify-between gap-8">
          {/* 描述信息（左） */}
          <div className="max-w-sm">
            <div className="mb-2 font-semibold text-lg">开放题库</div>
            <div className="text-sm text-foreground text-balance">以素养为导向的精准教学平台</div>
            <div className="mt-2 text-sm">
              <div>
                <Link to={"https://github.com/open-education/open-tiku"} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <div>举报电话: </div>
              <div>举报邮箱: zhangguangxun1@outlook.com</div>
            </div>
          </div>

          {/* 链接列表（右） */}
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            {links.map(({ title, items }) => (
              <ul key={title} className="flex-1 min-w-25">
                <p className="mb-2 text-sm font-semibold">{title}</p>
                {items.map(({ title, href, target }) => (
                  <li key={title} className="mb-1">
                    <Link to={href} target={target} rel="noopener noreferrer" className="text-xs text-foreground hover:text-primary">
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        {/* 底部版权：靠左对齐 */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
          <div className="text-base text-foreground text-left">&copy; 2026 开放题库. All Rights Reserved.</div>
          <div className="text-sm">
            ICP备案号:
            <Link to="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary">
              桂ICP备2026001793号-1
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
