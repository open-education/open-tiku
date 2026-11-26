import { GlobalError } from '@/components/common/error';
import Header from '@/components/home/header';
import { useUserInfo } from '@/hooks/use-user';
import { checkAccess, getMenuMap } from '@/util/menu';
import { finalUserLogin } from '@/util/user';
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
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
  // 用户登录临时 token 换票
  const navigate = useNavigate();

  useEffect(() => {
    finalUserLogin(navigate);
  }, []);

  const location = useLocation();
  const currentPath = location.pathname;

  const menuMap = useMemo(() => {
    return getMenuMap();
  }, []);

  // 登录用户信息
  const user = useUserInfo();

  // 当前菜单项目
  const currentMenu = menuMap[currentPath] || null;
  if (!checkAccess(user, currentMenu)) {
    return <GlobalError message="401" details="你没有权限访问这些内容" />;
  }

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
