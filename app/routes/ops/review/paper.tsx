import PaperSearchList from '@/components/paper/search';
import { PaperPageSource, PaperStatus } from '@/type/enum';
import type { PaperListReq } from '@/type/paper';
import { StringConst } from '@/util/string';
import { useState } from 'react';
import type { Route } from './+types/paper';

// 审核-题目审核

export function meta({}: Route.MetaArgs) {
  return [
    { title: '试卷审核' },
    {
      name: 'description',
      content: '对分配给我的试卷进行审核, 按要求分析并做出是否通过的决定',
    },
  ];
}

export default function Index() {
  const [listReq, setListReq] = useState<PaperListReq>({
    source: PaperPageSource.MyReview,
    twoLevelId: 0,
    status: PaperStatus.Pending,
    pageNo: 1,
    pageSize: StringConst.pageSize,
  });
  const updateListReq = (key: keyof PaperListReq, value: string | number) => {
    setListReq((prev) => ({ ...prev, [key]: value }));
  };

  return <PaperSearchList listReq={listReq} noDataDesc="当前没有查找到任何需要你审核的试卷。" updateListReq={updateListReq} />;
}
