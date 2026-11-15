import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的试卷' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

export default function Index() {
  return <div>我的试卷</div>;
}
