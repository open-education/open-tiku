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
        '打造协同共创的智能开放教育生态，依托优质题库与母子题分层资源，构建“教-学-练-评-补”全闭环。AI 赋能精准教学，为每位学生匹配专属的个性化学习路径。',
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
