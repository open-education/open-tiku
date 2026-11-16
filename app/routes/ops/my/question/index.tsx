import { QuestionPageSource, QuestionStatus } from '@/type/enum';
import { useMemo, useState } from 'react';

import { SimpleAlert } from '@/components/common/alert';
import { Loading } from '@/components/common/load';
import QuestionSearchList from '@/components/question/search';
import { StatusList } from '@/components/question/status';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import type { QuestionSearch } from '@/type/question';
import { useCountQuestionList } from '@/util/fetcher';
import { ArrayUtil } from '@/util/object';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的题目' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

// 我的题目

export default function Index() {
  const [activeStatus, setActiveStatus] = useState<number>(QuestionStatus.None);

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
  });
  const updateQuestionSearch = (key: keyof QuestionSearch, value: number | number[] | string[]) => {
    setQuestionSearch((prev) => ({ ...prev, [key]: value }));
  };

  const {
    data: countListResp = [],
    isLoading: countListRespLoading,
    error: countListRespErr,
    mutate: countListRespMutate,
  } = useCountQuestionList();
  const countMap = useMemo(() => {
    return ArrayUtil.arrayToDict(countListResp, 'status');
  }, [countListResp]);

  const showLoading = useDelayedLoading(countListRespLoading);

  return (
    <div className="space-y-3">
      <div className="px-3 py-1 bg-card">
        {/* 题目状态卡片 */}
        <StatusList
          countMap={countMap}
          activeStatus={activeStatus}
          onSelectStatus={(status) => {
            setActiveStatus(status);
            updateQuestionSearch('status', status);
          }}
        />
      </div>

      <div className="px-3">
        {countListRespErr && <SimpleAlert title="题目状态统计信息出错" message={countListRespErr.message} />}
        {showLoading && <Loading />}
      </div>

      <QuestionSearchList
        pageSource={QuestionPageSource.MyQuestion}
        showFilter={true}
        noDataDesc="没有查找到任何题目，如有题目，可以尝试上传题目，管理员审核通过后，其他人就可以看到该题目了。"
        questionSearch={questionSearch}
        updateQuestionSearch={updateQuestionSearch}
        countListRespMutate={countListRespMutate}
      />
    </div>
  );
}
