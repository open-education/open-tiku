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

// 网站首页
export default function Index() {
  return <div>工作台首页</div>;
}
