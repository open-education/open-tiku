import { Outlet } from 'react-router';
import { Footer } from '~/home/footer';

// 前台页包含网站 Footer
export default function Layout() {
  //  设置为 flex 纵向布局，并利用 calc 减去全站公用 Header 的高度
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* 给内容包裹区加上 flex-1 这样当内容为空时 它会自动无限拉伸 占满所有剩余高度 */}
      <main className="flex-1">
        <div className="px-4 py-4 sm:px-16 sm:py-4">
          <Outlet />
        </div>
      </main>

      {/* 网站底部 由于上方 main 设置了 flex-1 Footer 会被牢牢地顶在屏幕最下方 */}
      <Footer />
    </div>
  );
}
