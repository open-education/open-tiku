import { MyPaperSearchList } from "~/common/paper/search";
import type { Route } from "./+types/review";

export function meta({}: Route.MetaArgs) {
  return [{ title: "试卷-我的试卷审核" }, { name: "description", content: "个人中心我的试卷审核, 管理和维护分配给自己审核的试卷" }];
}

export default function Index() {
  return <MyPaperSearchList pageSource={{ source: "myReview" }} />;
}
