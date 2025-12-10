import type {Route} from "./+types/list";
import Index from "~/tiku/list";
import {StringConst, StringUtil, StringValidator} from "~/util/string";
import {httpClient} from "~/util/http";
import type {QuestionType} from "~/type/question";
import type {TagInfo} from "~/type/tag";
import type {Knowledge} from "~/type/guidance";
import type {Catalog} from "~/type/catalog";

export async function clientLoader({params}: Route.ClientLoaderArgs) {
    const key = params.key ?? "";
    let commonKey = "";
    let catalogList: Catalog[] = [];
    let knowledgeInfoList: Knowledge[] = [];

    if (StringValidator.endsWith(key, StringConst.chapter)) {
        commonKey = StringUtil.getFirstPart(key, StringConst.chapter);
        catalogList = await httpClient.get(`/config/get-catalogs/${commonKey}`);
    } else if (StringValidator.endsWith(key, StringConst.knowledge)) {
        commonKey = StringUtil.getFirstPart(key, StringConst.knowledge);
        knowledgeInfoList = await httpClient.get<Knowledge[]>(`/config/get-knowledge-info/${commonKey}`);
    } else {
        return {
            questionTypeList: [],
            tagList: [],
            catalogList: catalogList,
            knowledgeInfoList: knowledgeInfoList
        };
    }

    const questionTypeList = await httpClient.get<QuestionType>(`/config/get-question-types/${commonKey}`);
    const tagList = await httpClient.get<TagInfo>(`/config/get-tags/${commonKey}`);

    return {
        questionTypeList: questionTypeList,
        tagList: tagList,
        catalogList: catalogList,
        knowledgeInfoList: knowledgeInfoList
    };
}

export default function Home({loaderData}: Route.ComponentProps) {
    return <Index
        questionTypeList={loaderData.questionTypeList}
        tagList={loaderData.tagList}
        catalogList={loaderData.catalogList}
        knowledgeInfoList={loaderData.knowledgeInfoList}
    />;
}
