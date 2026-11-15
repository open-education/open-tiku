import type { Route } from './+types/paper';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '试卷中心' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

export default function Index() {
  return <div>试卷选题</div>;
}
