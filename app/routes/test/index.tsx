import type { Route } from "./+types/index";
import Index from "~/test";
import { httpClient } from "~/util/http";
import type { Textbook } from "~/type/textbook";
import { createTextbookPathDict } from "~/util/textbook-dict";

export function meta({}: Route.MetaArgs) {
  return [{ title: "开放组卷" }, { name: "description", content: "教材和知识点组卷" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // 5级教材字典列表
  const textbooks = await httpClient.get<Textbook[]>("/textbook/list/5/all");

  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层, 重复存储便于后续面包屑等使用
  const pathMap: Map<string, Textbook[]> = createTextbookPathDict(textbooks);

  return { textbooks, pathMap };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Index textbooks={loaderData.textbooks} pathMap={loaderData.pathMap} />;
}
