import QuestionSearchList from '@/components/question/search';
import { QuestionPageSource } from '@/type/enum';
import type { QuestionListReq } from '@/type/question';
import { StringConst } from '@/util/string';
import { useState } from 'react';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '题库中心' },
    {
      name: 'description',
      content: '对中小学教材按章节/知识点进行分类, 精选各学科/各类型的原创题目, 整理解析和归类已有的题目',
    },
  ];
}

// 搜索选题
export default function Index() {
  const [listReq, setListReq] = useState<QuestionListReq>({ source: QuestionPageSource.List, pageNo: 1, pageSize: StringConst.pageSize });
  const updateListReq = (key: keyof QuestionListReq, val: string | number[] | number) => {
    setListReq((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <QuestionSearchList
      pageSource={QuestionPageSource.List}
      showFilter={true}
      listReq={listReq}
      updateListReq={updateListReq}
      noDataDesc="没有查找到任何题目，如有题目，可以尝试上传题目，管理员审核通过后，其他人就可以看到该题目了。"
    />
  );
}
