import type { Route } from './+types/paper';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '试卷库' },
    {
      name: 'description',
      content: '精选历年高考，中考试卷；收录名校期末和月考试卷；根据学情和章节考点进行自主组卷。',
    },
  ];
}

export default function Index() {
  return <div>试卷选题</div>;
}
