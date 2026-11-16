import QuestionSearchList from '@/components/question/search';
import { QuestionPageSource, QuestionStatus } from '@/type/enum';
import type { QuestionSearch } from '@/type/question';
import { useState } from 'react';
import type { Route } from './+types/question';

// 审核-题目审核

export function meta({}: Route.MetaArgs) {
  return [
    { title: '题目审核' },
    {
      name: 'description',
      content: '个人中心, 系统设置, 关联教材章节和知识点知识点的关联关系',
    },
  ];
}

// 题型关联
export default function Index() {
  // 搜索对象维护
  const [questionSearch, setQuestionSearch] = useState<QuestionSearch>({
    twoLevelId: 0,
    fiveLevelId: 0,
    fiveLevelSelectKeys: [],
    eightIds: [],
    eightLevelSelectKeys: [],
    typeId: 0,
    tagIds: [],
    dimensionIds: [],
    levelIds: [],
    sceneIds: [],
    mistakeTipIds: [],
    status: QuestionStatus.Pending,
  });
  const updateQuestionSearch = (key: keyof QuestionSearch, value: number | number[] | string[]) => {
    setQuestionSearch((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <QuestionSearchList
      pageSource={QuestionPageSource.MyReview}
      showFilter={false}
      noDataDesc="当前没有查找到任何需要你审核的题目。"
      questionSearch={questionSearch}
      updateQuestionSearch={updateQuestionSearch}
    />
  );
}
