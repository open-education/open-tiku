import type { Route } from "./+types/list";
import Index from "~/test/list/index";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return {};
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Index />;
}
