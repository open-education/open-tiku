import { GlobalError } from '@/components/common/error';
import { useCurrentMenu } from '@/hooks/use-current-menu';
import { finalUserLogin } from '@/util/user';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

// 需要权限校验的路由守卫
export default function Auth() {
  const navigate = useNavigate();
  const { hasAccess } = useCurrentMenu();

  useEffect(() => {
    finalUserLogin(navigate);
  }, [navigate]);

  if (!hasAccess) {
    return <GlobalError message="401" details="你没有权限访问这些内容" />;
  }

  return <Outlet />;
}
