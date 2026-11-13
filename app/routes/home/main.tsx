import Footer from '@/components/home/footer';
import Header from '@/components/home/header';
import { finalUserLogin } from '@/util/user';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import type { Route } from './+types/main';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '开放题库 · 公益共建' },
    {
      name: 'description',
      content:
        '协同共创 · 智能开放教育生态，优质题库协同共创，AI 助力精准教学，让每个学生获得适配自身的个性化学习路径，依托母子题分层资源，打造「教-学-练-评-补」全闭环智能开放教育生态。',
    },
  ];
}

// 网站首页布局
export default function Main() {
  // 用户登录临时 token 换票
  const navigate = useNavigate();

  useEffect(() => {
    finalUserLogin(navigate);
  }, []);

  return (
    <div className="text-foreground bg-background min-h-screen flex flex-col">
      {/* 网站首页头部 */}
      <Header />

      {/* 替换网站内容 */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* 网站脚部 */}
      <Footer />
    </div>
  );
}
