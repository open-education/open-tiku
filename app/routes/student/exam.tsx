import type { Route } from './+types/exam';
import { useLocation } from 'react-router';
import { EditEaxm } from '~/student/test/exam';

/// 学生做题首页
export function meta({}: Route.MetaArgs) {
  return [
    { title: '开放题库-正在练题' },
    {
      name: 'description',
      content:
        '选择你要做的作业，练习模式为快速刷题，可实时查看答案等说明巩固知识；考试模式需要交卷后可查看答案；你可以记录自己做题的感悟或笔记，方便后续复习该题。',
    },
  ];
}

export default function Index() {
  const location = useLocation();
  const { hId, paperId, examMethod } = location.state || {};

  return <EditEaxm hId={hId} paperId={paperId} examMethod={examMethod} />;
}
