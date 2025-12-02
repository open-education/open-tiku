import type {Route} from "./+types/list";
import List from "~/tiku/list";

export async function clientLoader({params}: Route.LoaderArgs) {
    return {};
}

export default function Home({loaderData}: Route.ComponentProps) {
    return <List/>;
}
