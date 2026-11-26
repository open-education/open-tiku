import { HomeWorkList } from '@/components/student/homework';
import type { Route } from './+types/homework';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的作业' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

// 我的作业
export default function Index() {
  return (
    <div className="px-3">
      <HomeWorkList />
    </div>
  );
}
