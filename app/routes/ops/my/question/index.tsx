import { QuestionPageSource, QuestionStatus } from '@/type/enum';
import { useMemo, useState } from 'react';

import { SimpleAlert } from '@/components/common/alert';
import type { StatItem } from '@/components/common/list';
import { ListCard } from '@/components/common/list';
import { Loading } from '@/components/common/load';
import QuestionSearchList from '@/components/question/search';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import type { QuestionSearch } from '@/type/question';
import { useCountQuestionList } from '@/util/fetcher';
import { ArrayUtil } from '@/util/object';
import { Check, Clock, FileQuestion, PencilLine, X } from 'lucide-react';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的题目' },
    {
      name: 'description',
      content: '查看和管理维护我的题目',
    },
  ];
}

// 我的题目

// 题目状态列表
const defaultStatusList: StatItem[] = [
  {
    id: 1,
    title: '全部题目',
    value: QuestionStatus.None,
    icon: FileQuestion,
    count: 0,
    desc: '我的全部题目',
    theme: {
      dot: 'bg-blue-500',
      iconActive: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      ring: 'border-blue-500/60 ring-2 ring-blue-500/10',
    },
  },
  {
    id: 2,
    title: '草稿中',
    value: QuestionStatus.Drafting,
    icon: PencilLine,
    count: 0,
    desc: '可编辑的题目',
    theme: {
      dot: 'bg-zinc-400',
      iconActive: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
      ring: 'border-zinc-500/60 ring-2 ring-zinc-500/10',
    },
  },
  {
    id: 3,
    title: '已通过',
    value: QuestionStatus.Published,
    icon: Check,
    count: 0,
    desc: '所有人可查看',
    theme: {
      dot: 'bg-emerald-500',
      iconActive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      ring: 'border-emerald-500/60 ring-2 ring-emerald-500/10',
    },
  },
  {
    id: 4,
    title: '待审核',
    value: QuestionStatus.Pending,
    icon: Clock,
    count: 0,
    desc: '不可编辑待他人审核',
    theme: {
      dot: 'bg-amber-500',
      iconActive: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      ring: 'border-amber-500/60 ring-2 ring-amber-500/10',
    },
  },
  {
    id: 5,
    title: '未通过',
    value: QuestionStatus.Rejected,
    icon: X,
    count: 0,
    desc: '按拒绝理由修改',
    theme: {
      dot: 'bg-rose-500',
      iconActive: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      ring: 'border-rose-500/60 ring-2 ring-rose-500/10',
    },
  },
];

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

  const { data: countListResp = [], isLoading: countListRespLoading, error: countListRespErr, mutate: countListRespMutate } = useCountQuestionList();
  const questionStatusList = useMemo(() => {
    if (!countListResp || countListResp.length === 0) return defaultStatusList;
    const totalCount = countListResp.reduce((sum, item) => sum + (item.count ?? 0), 0);

    const map = ArrayUtil.arrayToDict(countListResp, 'status');
    return defaultStatusList.map((item) => ({
      ...item,
      count: item.value === QuestionStatus.None ? totalCount : (map[item.value]?.count ?? 0),
    }));
  }, [countListResp]);

  const showLoading = useDelayedLoading(countListRespLoading);

  return (
    <div className="space-y-3">
      <div className="px-3 py-1 bg-card">
        {/* 题目状态卡片 */}
        <ListCard
          options={questionStatusList}
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
