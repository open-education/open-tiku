import Add from '@/components/question/add';
import { QuestionRelationType } from '@/type/enum';
import type { CreateQuestionReq } from '@/type/question';
import type { Route } from './+types/add';

/// 添加母题

export function meta({}: Route.MetaArgs) {
  return [
    { title: '添加母题' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

// 初始化部分默认值
const initAddDefaultReq: CreateQuestionReq = {
  questionCateId: 0,
  questionTypeId: 0,
  originalName: '',
  title: '',
  difficultyLevel: 1.0,
  optionsLayout: 1,
  source: '',
  status: 0,
  relationType: QuestionRelationType.Base, // 默认均添加母题
  levelId: 0,
};

export default function Index() {
  return <Add key="add" initAddReq={initAddDefaultReq} />;
}
