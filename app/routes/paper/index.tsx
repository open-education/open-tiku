import { httpClient } from "~/util/http";
import type { Route } from "./+types/index";
import Index from "~/paper/index";
import type { Textbook } from "~/type/textbook";

export function meta({}: Route.MetaArgs) {
  return [{ title: "精选试卷" }, { name: "description", content: "精选历年高考，中考试卷；收录名校期末和月考试卷。" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // 5级教材字典列表
  const textbooks = await httpClient.get<Textbook[]>("/textbook/list/5/all");

  return { textbooks };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Index textbooks={loaderData.textbooks} />;
}
