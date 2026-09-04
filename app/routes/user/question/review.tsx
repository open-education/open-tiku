import type { Route } from './+types/review';
import { QuestionSearchPage } from '~/common/question/search';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '题目-我的题目审核' },
    {
      name: 'description',
      content: '个人中心我的题目审核, 管理和维护分配给自己审核的题目',
    },
  ];
}

// 我的题目审核列表
export default function Index() {
  return <QuestionSearchPage pageSource={{ source: 'myReview' }} className="p-4" />;
}
