import type { Route } from "./+types/index";
import { type SelectNavProps } from "~/common/nav";
import { useLocation } from "react-router";
import { QuestionSearchPage } from "~/common/question/search";

/// 题目首页

export function meta({}: Route.MetaArgs) {
  return [{ title: "题目库" }, { name: "description", content: "教材章节, 知识点题库" }];
}

// 题目相关后续操作都在这个路由内完成
export default function Home() {
  const location = useLocation();
  // 首页可能传递过来已经选择好的导航级联信息keys列表
  const selectNavProps: SelectNavProps = location.state?.selectNavProps ?? {};

  return <QuestionSearchPage selectNavProps={selectNavProps} pageSource={{ source: "list" }} />;
}
