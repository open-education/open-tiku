import { Error } from '@/common/error';
import { useUserInfo } from '@/hooks/use-user';
import { UserRoleType } from '@/type/enum';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '工作台' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

// 权限守卫-工作台普通用户登录即可
export default function Guard() {
  const currentUser = useUserInfo();
  if (!currentUser || currentUser.role === UserRoleType.Student) {
    return <Error message="401" details="你无权访问这些内容" />;
  }

  return <Index />;
}

// 网站首页
function Index() {
  return <div>工作台首页</div>;
}
