import type {Route} from "./+types/list";
import Index from "~/tiku/list";
import {StringConst, StringUtil, StringValidator} from "~/util/string";
import {httpClient} from "~/util/http";
import type {QuestionType} from "~/type/question";
import type {TagInfo} from "~/type/tag";
import type {Knowledge} from "~/type/guidance";
import type {Catalog} from "~/type/catalog";
import {Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import React from "react";
import {HierarchicalDict} from "~/util/hierarchical-dict";

export async function clientLoader({params}: Route.ClientLoaderArgs) {
  const key = params.key ?? "";
  let commonKey = "";
  let catalogList: Catalog[] = [];
  let catalogDict: HierarchicalDict<Catalog> = new HierarchicalDict<Catalog>([]);
  let knowledgeInfoList: Knowledge[] = [];
  let knowledgeInfoDict: HierarchicalDict<Knowledge> = new HierarchicalDict<Knowledge>([]);

  if (StringValidator.endsWith(key, StringConst.chapter)) {
    commonKey = StringUtil.getFirstPart(key, StringConst.chapter);
    catalogList = await httpClient.get<Catalog[]>(`/config/get-catalogs/${commonKey}`);
    catalogDict = new HierarchicalDict<Catalog>(catalogList);
  } else if (StringValidator.endsWith(key, StringConst.knowledge)) {
    commonKey = StringUtil.getFirstPart(key, StringConst.knowledge);
    knowledgeInfoList = await httpClient.get<Knowledge[]>(`/config/get-knowledge-info/${commonKey}`);
    knowledgeInfoDict = new HierarchicalDict<Knowledge>(knowledgeInfoList);
  } else {
    return {
      questionTypeList: [],
      tagList: [],
      catalogList: catalogList,
      catalogDict: catalogDict,
      knowledgeInfoList: knowledgeInfoList,
      knowledgeInfoDict: knowledgeInfoDict
    };
  }

  const questionTypeList = await httpClient.get<QuestionType>(`/config/get-question-types/${commonKey}`);
  const tagList = await httpClient.get<TagInfo>(`/config/get-tags/${commonKey}`);

  return {
    questionTypeList: questionTypeList,
    tagList: tagList,
    catalogList: catalogList,
    catalogDict: catalogDict,
    knowledgeInfoList: knowledgeInfoList,
    knowledgeInfoDict: knowledgeInfoDict,
  };
}

// HydrateFallback is rendered while the client loader is running
export function HydrateFallback() {
  return <Spin indicator={<LoadingOutlined spin/>}/>
}

export default function Home({loaderData}: Route.ComponentProps) {
  return <Index
    questionTypeList={loaderData.questionTypeList}
    tagList={loaderData.tagList}
    catalogList={loaderData.catalogList}
    catalogDict={loaderData.catalogDict}
    knowledgeInfoList={loaderData.knowledgeInfoList}
    knowledgeInfoDict={loaderData.knowledgeInfoDict}
  />;
}
