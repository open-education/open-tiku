import type {Route} from "./+types/index";
import Index from "~/home";
import {httpClient} from "~/util/http";
import type {Publisher} from "~/type/guidance";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "开放题库"},
        {
            name: "description",
            content:
                "开源题库系统，提供小学、初中、高中各阶段各科目的配套题目维护、个性化试题和个性化组卷",
        },
    ];
}

export async function clientLoader({params}: Route.LoaderArgs) {
    // 学科引导数据
    const guidance = await httpClient.get<Publisher[]>("/config/get-guidance");

    return {guidance: guidance};
}

export default function Home({loaderData}: Route.ComponentProps) {
    return <Index guidance={loaderData.guidance}/>;
}
