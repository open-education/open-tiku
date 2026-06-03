import type { Route } from "./+types/info";
import Index from "~/test/info/index";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return {};
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Index />;
}
