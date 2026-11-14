import type { Route } from './+types/paper';

// 审核-题目审核

export function meta({}: Route.MetaArgs) {
  return [
    { title: '审核-试卷审核' },
    {
      name: 'description',
      content: '个人中心, 系统设置, 关联教材章节和知识点考点的关联关系',
    },
  ];
}

// 题型关联
export default function Index() {
  return <div>审核-试卷审核</div>;
}
