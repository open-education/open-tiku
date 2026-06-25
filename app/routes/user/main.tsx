import { Outlet } from "react-router";
import type { Route } from "./+types/main";

// 个人中心首页

/// 网站首页顶部和底部框架
export function meta({}: Route.MetaArgs) {
  return [
    { title: "个人中心" },
    {
      name: "description",
      content: "作为作者，管理我上传的题目和试卷；作为老师，负责审核其他人上传和修改的题目和试卷; 建立自己的班级并管理学生; 管理网站基础配置等.",
    },
  ];
}

export default function Index() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
