import type {Route} from "./+types/index";
import Index from "~/tiku";
import {httpClient} from "~/util/http";
import type {Publisher} from "~/type/guidance";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "开放题库"},
        {name: "description", content: "教材章节, 知识点题库"},
    ];
}

export async function clientLoader({params}: Route.ClientLoaderArgs) {
    const guidance = await httpClient.get<Publisher[]>("/config/get-guidance");

    return {guidance: guidance};
}

export default function Home({loaderData}: Route.ComponentProps) {
    return <Index guidance={loaderData.guidance}/>
}
