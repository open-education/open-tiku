import type { Route } from "./+types/main";
import { Footer } from "~/home/footer";
import { Header } from "~/home/header";
import { Outlet } from "react-router";

/// 网站首页顶部和底部框架
export function meta({}: Route.MetaArgs) {
  return [
    { title: "开放题库" },
    {
      name: "description",
      content: "根据中小学教材章节和教育部发布的考点进行选题，精选历年高考中考和名校期末月考等试卷，辅助教学视频等给学生提供精选的题库进行练习。",
    },
  ];
}

// 首页样式后续根据需要调整, 需要将所有请求封装进入组件挂载时请求
// 其它页面后续替换只保留静态的头和底
export default function Main() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* 网站首页头部 */}
      <div>
        <Header />
      </div>

      {/* 替换网站内容 */}
      <div>
        <Outlet />
      </div>

      {/* ── Footer ── */}
      <div>
        <Footer />
      </div>
    </div>
  );
}
