import type { Route } from "./+types/index";
import { MyPaperSearchList } from "~/common/paper/search";

// 我的试卷

export function meta({}: Route.MetaArgs) {
  return [
    { title: "试卷-我的试卷" },
    {
      name: "description",
      content: "个人中心我的试卷，管理和维护自己名下的试卷; 精选试卷简单提交审核即可; 手动组卷进行题目排序和替换; 将试卷发布到班级, 进行作业布置",
    },
  ];
}

export default function Index() {
  return <MyPaperSearchList pageSource={{ source: "myPaper" }} />;
}
