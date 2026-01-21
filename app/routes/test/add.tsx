import type { Route } from "./+types/add";
import Add from "~/test/add/index";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { httpClient } from "~/util/http";
import type { Textbook, TextbookOption } from "~/type/textbook";
import { ArrayUtil } from "~/util/object";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const reqId: number = Number(params.textbookId ?? 0);

  // 第6-8层级的菜单
  const textbooks = await httpClient.get<Textbook[]>(
    `/textbook/list/${reqId}/children`,
  );

  const textbookOptions: TextbookOption[] =
    ArrayUtil.mapTextbookToOption(textbooks);

  return { textbookOptions };
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <Spin indicator={<LoadingOutlined spin />} />;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Add textbookOptions={loaderData.textbookOptions} />;
}
