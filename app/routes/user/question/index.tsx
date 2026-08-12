import type { Route } from "./+types/index";
import { QuestionSearchPage } from "~/common/question/search";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "题目-我的题目" },
    {
      name: "description",
      content: "个人中心我的题目, 管理和维护自己名下的题目",
    },
  ];
}

// 我的题目列表
export default function QuestionList() {
  return <QuestionSearchPage pageSource={{ source: "myQuestion" }} className="p-4" />;
}
