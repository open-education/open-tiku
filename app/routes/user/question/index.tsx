import { QuestionSearchPage } from "~/common/question/search";

// 我的题目列表
export default function QuestionList() {
  return <QuestionSearchPage pageSource={{ source: "myQuestion" }} />;
}
