import type { Route } from "./+types/info";
import Index from "~/test/info/index";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return {};
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <Spin indicator={<LoadingOutlined spin />} />;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Index />;
}
