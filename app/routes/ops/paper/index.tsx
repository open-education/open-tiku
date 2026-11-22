import type { Route } from './+types/index';

// 智能组卷

export function meta({}: Route.MetaArgs) {
  return [
    { title: '智能组卷' },
    {
      name: 'description',
      content: '个人中心, 系统设置, 关联教材章节和知识点知识点的关联关系',
    },
  ];
}

// 题型关联
export default function Index() {
  return <div>智能组卷</div>;
}
