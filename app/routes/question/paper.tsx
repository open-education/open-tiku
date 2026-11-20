import PaperSearchList from '@/components/paper/search';
import { PaperPageSource } from '@/type/enum';
import type { PaperListReq } from '@/type/paper';
import { StringConst } from '@/util/string';
import { useState } from 'react';
import type { Route } from './+types/paper';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '试卷选题' },
    {
      name: 'description',
      content: '精选历年高考，中考试卷；收录名校期末和月考试卷；根据学情和章节考点进行自主组卷。',
    },
  ];
}

export default function Index() {
  const [listReq, setListReq] = useState<PaperListReq>({
    source: PaperPageSource.List,
    twoLevelId: 0,
    pageNo: 1,
    pageSize: StringConst.pageSize,
  });
  const updateListReq = (key: keyof PaperListReq, value: string | number) => {
    setListReq((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <PaperSearchList
      listReq={listReq}
      noDataDesc="没有查找到任何试卷，如有试卷，可以尝试上传试卷，管理员审核通过后，其他人就可以看到该试卷了。"
      updateListReq={updateListReq}
    />
  );
}
