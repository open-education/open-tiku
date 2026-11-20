import { SimpleAlert } from '@/components/common/alert';
import { ListCard, type StatItem } from '@/components/common/list';
import { Loading } from '@/components/common/load';
import PaperSearchList from '@/components/paper/search';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import { PaperPageSource, PaperStatus } from '@/type/enum';
import type { PaperListReq } from '@/type/paper';
import { useCountPaperList } from '@/util/fetcher';
import { ArrayUtil } from '@/util/object';
import { StringConst } from '@/util/string';
import { BookOpen, Check, Clock, PencilLine, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的试卷' },
    {
      name: 'description',
      content: '查看和管理维护我的试卷',
    },
  ];
}

// 题目状态列表
const defaultStatusList: StatItem[] = [
  {
    id: 1,
    title: '全部试卷',
    value: PaperStatus.None,
    icon: BookOpen,
    count: 0,
    desc: '我的全部试卷',
    theme: {
      dot: 'bg-blue-500',
      iconActive: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      ring: 'border-blue-500/60 ring-2 ring-blue-500/10',
    },
  },
  {
    id: 2,
    title: '草稿中',
    value: PaperStatus.Drafting,
    icon: PencilLine,
    count: 0,
    desc: '可编辑的试卷',
    theme: {
      dot: 'bg-zinc-400',
      iconActive: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
      ring: 'border-zinc-500/60 ring-2 ring-zinc-500/10',
    },
  },
  {
    id: 3,
    title: '已通过',
    value: PaperStatus.Published,
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
    value: PaperStatus.Pending,
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
    value: PaperStatus.Rejected,
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
  const [activeStatus, setActiveStatus] = useState<number>(PaperStatus.None);

  const { data: countListResp = [], isLoading: countListRespLoading, error: countListRespErr, mutate: countListRespMutate } = useCountPaperList();
  const questionStatusList = useMemo(() => {
    if (!countListResp || countListResp.length === 0) return defaultStatusList;
    const totalCount = countListResp.reduce((sum, item) => sum + (item.count ?? 0), 0);

    const map = ArrayUtil.arrayToDict(countListResp, 'status');
    return defaultStatusList.map((item) => ({
      ...item,
      count: item.value === PaperStatus.None ? totalCount : (map[item.value]?.count ?? 0),
    }));
  }, [countListResp]);

  const showLoading = useDelayedLoading(countListRespLoading);

  const [listReq, setListReq] = useState<PaperListReq>({
    source: PaperPageSource.MyPaper,
    twoLevelId: 0,
    status: activeStatus,
    pageNo: 1,
    pageSize: StringConst.pageSize,
  });
  const updateListReq = (key: keyof PaperListReq, value: string | number) => {
    setListReq((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-3">
      <div className="px-3 py-1 bg-card">
        {/* 题目状态卡片 */}
        <ListCard
          options={questionStatusList}
          activeStatus={activeStatus}
          onSelectStatus={(status) => {
            setActiveStatus(status);
            updateListReq('status', status);
          }}
        />
      </div>
      <div className="px-3">
        {countListRespErr && <SimpleAlert title="试卷状态统计信息出错" message={countListRespErr.message} />}
        {showLoading && <Loading />}
      </div>
      <PaperSearchList
        listReq={listReq}
        noDataDesc="没有查找到任何试卷，如有试卷，可以尝试上传试卷，管理员审核通过后，其他人就可以看到该试卷了。"
        updateListReq={updateListReq}
        countListRespMutate={countListRespMutate}
      />
      ;
    </div>
  );
}
