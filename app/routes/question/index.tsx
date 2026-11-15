import QuestionSearchList from '@/components/question/search';
import { QuestionPageSource, QuestionStatus } from '@/type/enum';
import type { QuestionSearch } from '@/type/question';
import { useState } from 'react';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '题库中心' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

// 搜索选题
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
    status: QuestionStatus.Published,
  });
  const updateQuestionSearch = (key: keyof QuestionSearch, value: number | number[] | string[]) => {
    setQuestionSearch((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <QuestionSearchList
      pageSource={QuestionPageSource.List}
      showFilter={true}
      questionSearch={questionSearch}
      updateQuestionSearch={updateQuestionSearch}
      noDataDesc="没有查找到任何题目，如有题目，可以尝试上传题目，管理员审核通过后，其他人就可以看到该题目了。"
    />
  );
}
