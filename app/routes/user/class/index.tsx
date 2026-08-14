import type { Route } from "./+types/index";

// 我的班级

export function meta({}: Route.MetaArgs) {
  return [
    { title: "班级-我的班级" },
    {
      name: "description",
      content: "个人中心我的班级管理; 导入班级学生账号",
    },
  ];
}

export default function Index() {
  return <div>我的班级</div>;
}
