import Header from '@/components/home/header';
import { Outlet } from 'react-router';
import type { Route } from './+types/main';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的学习' },
    {
      name: 'description',
      content: '我的学习页面',
    },
  ];
}

// 网站首页布局
export default function Main() {
  return (
    <div className="text-foreground bg-background min-h-screen flex flex-col space-y-3">
      {/* 网站首页头部 */}
      <Header />

      {/* 替换网站内容 */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
