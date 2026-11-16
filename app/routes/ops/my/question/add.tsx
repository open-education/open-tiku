import Add from '@/components/question/add';
import { QuestionRelationType } from '@/type/enum';
import type { QuestionInfoResp, QuestionListResp, QuestionSearch } from '@/type/question';
import type { KeyedMutator } from 'swr';
import type { Route } from './+types/add';

/// 题目添加

export function meta({}: Route.MetaArgs) {
  return [
    { title: '添加母题/变式题' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

interface IndexProps {
  questionSearch: QuestionSearch; // 列表页面搜索携带的信息
  infoResp?: QuestionInfoResp; // 初始化数据信息, 比如修改时会是详情完整信息
  addRelationType?: QuestionRelationType; // 添加题目类型

  questionListRespMutate?: KeyedMutator<QuestionListResp>; // 编辑时也要刷新列表
}

export default function Index({ questionSearch, infoResp, addRelationType, questionListRespMutate }: IndexProps) {
  return (
    <Add questionSearch={questionSearch} infoResp={infoResp} addRelationType={addRelationType}
         questionListRespMutate={questionListRespMutate} />
  );
}
