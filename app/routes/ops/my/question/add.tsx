import { Error } from '@/common/error';
import { useUserInfo } from '@/hooks/use-user';
import { UserRoleType } from '@/type/enum';

// 权限守卫-添加题目普通用户登录即可
export default function Guard() {
  const currentUser = useUserInfo();
  if (!currentUser || currentUser.role === UserRoleType.Student) {
    return <Error message="401" details="你无权访问这些内容" />;
  }

  return <Index />;
}

function Index() {
  return <div>添加题目</div>;
}
