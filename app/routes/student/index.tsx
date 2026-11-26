import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '学习首页' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

// 学习首页
export default function Index() {
  return <div>学习首页</div>;
}
