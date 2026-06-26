import { QuestionSearchPage } from "~/common/question/search";

// 我的题目审核列表
export default function Index() {
  return <QuestionSearchPage pageSource={{ source: "myReview" }} />;
}
