import type { Route } from "./+types/similar";
import Index from "~/tiku/similar/index";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { httpClient } from "~/util/http";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";
import { createTextbookPathDict } from "~/util/textbook-dict";

export function meta({}: Route.MetaArgs) {
  return [{ title: "变式题列表" }, { name: "description", content: "教材章节, 知识点题库变式题列表" }];
}

export async function clientLoader({ params, request }: Route.ClientLoaderArgs) {
  const textbookId: number = Number(params.textbookId ?? 0);

  const url = new URL(request.url);
  const questionId = Number(url.searchParams.get("id") || 0);
  const questionCateId = Number(url.searchParams.get("cateId") || 0);

  // 并发请求
  const [textbooks, childTextbooks] = await Promise.all([
    // 5级教材字典列表
    httpClient.get<Textbook[]>("/textbook/list/5/all"),
    // 第6-8层级的菜单
    httpClient.get<Textbook[]>(`/textbook/list/${textbookId}/children`),
  ]);

  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层, 重复存储便于后续面包屑等使用
  const pathMap: Map<number, Textbook[]> = createTextbookPathDict(textbooks);
  const childPathMap: Map<number, Textbook[]> = createTextbookPathDict(childTextbooks);

  // 获取题型类型和标签
  let questionTypeList: TextbookOtherDict[] = [];
  let questionTagList: TextbookOtherDict[] = [];

  // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再3层深度上, 因此只要有3层深度就可以把题型类型和标签返回, 后续如果有优化再处理
  const nodes: Textbook[] = pathMap.get(textbookId) ?? [];
  if (nodes.length >= 3) {
    // 目前题型和标签类型挂载在第三层上
    const typeId: number = nodes[2].id;

    [questionTypeList, questionTagList] = await Promise.all([
      httpClient.get<TextbookOtherDict[]>(`/other/dict/list/${typeId}/question_type`),
      httpClient.get<TextbookOtherDict[]>(`/other/dict/list/${typeId}/question_tag`),
    ]);
  }

  return { textbookId, questionId, questionCateId, pathMap, childPathMap, questionTypeList, questionTagList };
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <Spin indicator={<LoadingOutlined spin />} />;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <Index
      textbookId={loaderData.textbookId}
      questionId={loaderData.questionId}
      questionCateId={loaderData.questionCateId}
      pathMap={loaderData.pathMap}
      childPathMap={loaderData.childPathMap}
      questionTypeList={loaderData.questionTypeList}
      questionTagList={loaderData.questionTagList}
    />
  );
}
