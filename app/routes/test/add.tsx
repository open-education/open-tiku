import type { Route } from "./+types/add";
import Add from "~/test/add/index";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { httpClient } from "~/util/http";
import type { Textbook, TextbookOption, TextbookOtherDict } from "~/type/textbook";
import { ArrayUtil } from "~/util/object";
import { createTextbookPathDict } from "~/util/textbook-dict";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const reqId: number = Number(params.textbookId ?? 0);

  // 5级教材字典列表
  const textbooks = await httpClient.get<Textbook[]>("/textbook/list/5/all");

  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层, 重复存储便于后续面包屑等使用
  const pathMap: Map<number, Textbook[]> = createTextbookPathDict(textbooks);

  // 第6-8层级的菜单
  const childTextbooks = await httpClient.get<Textbook[]>(`/textbook/list/${reqId}/children`);

  // 获取题型类型和标签
  let questionTypeList: TextbookOtherDict[] = [];
  let questionTagList: TextbookOtherDict[] = [];

  // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再3层深度上, 因此只要有3层深度就可以把题型类型和标签返回, 后续如果有优化再处理
  const nodes: Textbook[] = pathMap.get(reqId) ?? [];
  if (nodes.length >= 3) {
    // 目前题型和标签类型挂载在第三层上
    const typeId: number = nodes[2].id;
    questionTypeList = await httpClient.get<TextbookOtherDict[]>(`/other/dict/list/${typeId}/question_type`);
    questionTagList = await httpClient.get<TextbookOtherDict[]>(`/other/dict/list/${typeId}/question_tag`);
  }

  // 级联菜单选择用
  const textbookOptions: TextbookOption[] = ArrayUtil.mapTextbookToOption(childTextbooks);

  return { textbookOptions, questionTypeList, questionTagList };
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <Spin indicator={<LoadingOutlined spin />} />;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <Add textbookOptions={loaderData.textbookOptions} questionTypeList={loaderData.questionTypeList} questionTagList={loaderData.questionTagList} />
  );
}
