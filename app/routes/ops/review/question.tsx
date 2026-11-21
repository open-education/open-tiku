import QuestionSearchList from '@/components/question/search';
import { QuestionPageSource, QuestionStatus } from '@/type/enum';
import type { QuestionListReq } from '@/type/question';
import { StringConst } from '@/util/string';
import { useState } from 'react';
import type { Route } from './+types/question';

// 审核-题目审核

export function meta({}: Route.MetaArgs) {
  return [
    { title: '题目审核' },
    {
      name: 'description',
      content: '对分配给我的题目进行审核, 按要求分析并做出是否通过的决定',
    },
  ];
}

// 题型关联
export default function Index() {
  const [listReq, setListReq] = useState<QuestionListReq>({
    source: QuestionPageSource.MyReview,
    status: QuestionStatus.Pending,
    pageNo: 1,
    pageSize: StringConst.pageSize,
  });
  const updateListReq = (key: keyof QuestionListReq, val: string | number[] | number) => {
    setListReq((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <QuestionSearchList
      pageSource={QuestionPageSource.MyReview}
      showFilter={false}
      noDataDesc="当前没有查找到任何需要你审核的题目。"
      listReq={listReq}
      updateListReq={updateListReq}
    />
  );
}
