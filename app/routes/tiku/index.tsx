import type {Route} from "./+types/index";
import Index from "~/tiku";
import {httpClient} from "~/util/http";
import type {Subject} from "~/type/guidance";
import {LoadingOutlined} from "@ant-design/icons";
import {Spin} from "antd";
import React from "react";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "开放题库"},
        {name: "description", content: "教材章节, 知识点题库"},
    ];
}

export async function clientLoader({params}: Route.ClientLoaderArgs) {
    const guidance = await httpClient.get<Subject[]>("/config/get-guidance");

    return {guidance: guidance};
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
    return <Spin indicator={<LoadingOutlined spin/>}/>
}

export default function Home({loaderData}: Route.ComponentProps) {
    return <Index guidance={loaderData.guidance}/>
}
