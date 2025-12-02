import type {Route} from "./+types/index";
import Index from "~/tiku";
import {httpClient} from "~/util/http";
import type {Subject} from "~/type/guidance";
import {StringValidator} from "~/util/string";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "题目列表"},
        {name: "description", content: "教材章节题目列表"},
    ];
}

// 进入该页面时 textbookKey 为全局必须存在
// catalogKey 为点击左侧目录菜单时存在
export async function clientLoader({params}: Route.LoaderArgs) {
    // 根据出版社获取下面的所有科目等信息列表
    const subjectList = await httpClient.get<Subject[]>(`/config/get-guidance-by-publisher/${params.textbookKey}`);
    // 默认菜单需要根据 textbookKey 来选取
    let defaultSelectMenuKey = "";
    if (subjectList && subjectList.length > 0) {
        for (let i = 0; i < subjectList.length; i++) {
            if (StringValidator.startsWith(params.textbookKey, subjectList[i].key)) {
                const stageChildren = subjectList[i].children;
                if (stageChildren && stageChildren.length > 0) {
                    const textbookChildren = stageChildren[0].children;
                    if (textbookChildren && textbookChildren.length > 0) {
                        defaultSelectMenuKey = textbookChildren[0].key;
                    }
                }
                break;
            }
        }
    }

    return {
        subjectList: subjectList,
        defaultSelectMenuKey: defaultSelectMenuKey,
    };
}

export default function Home({loaderData}: Route.ComponentProps) {
    return (
        <Index
            subjectList={loaderData.subjectList}
            defaultSelectMenuKey={loaderData.defaultSelectMenuKey}
        />
    );
}
