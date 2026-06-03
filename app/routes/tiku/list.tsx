import type { Route } from "./+types/list";
import Index from "~/tiku/list";
import { httpClient } from "~/util/http";
import type { Textbook } from "~/type/textbook";
import { createTextbookPathDict } from "~/util/textbook-dict";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const reqId: number = Number(params.textbookId ?? 0);

  // 第6-8层级的菜单
  const textbooks = await httpClient.get<Textbook[]>(`/textbook/list/${reqId}/children`);

  // 构建字典
  const childPathMap: Map<string, Textbook[]> = createTextbookPathDict(textbooks);

  return { textbooks, childPathMap };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Index textbooks={loaderData.textbooks} childPathMap={loaderData.childPathMap} />;
}
