import { Outlet } from "react-router";
import { useUserInfo } from "~/hooks/use-user";
import { UserRoleType } from "~/type/enum";

// 学生用户个人中心

export default function Index() {
  // 未登录用户不渲染任何子页面
  const currentUser = useUserInfo();

  // 学生用户才加载首页
  if (!currentUser || currentUser.role !== UserRoleType.Student) {
    return <div></div>;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}
