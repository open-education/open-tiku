import type { Route } from './+types/upload';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '上传试卷' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

export default function Index() {
  return <div>上传试卷</div>;
}
