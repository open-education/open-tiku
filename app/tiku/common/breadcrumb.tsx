import {Breadcrumb} from "antd";
import React from "react";
import type {Catalog} from "~/type/catalog";
import {StringConst, StringUtil, StringValidator} from "~/util/string";
import type {BreadcrumbItemType} from "antd/lib/breadcrumb/Breadcrumb";
import type {KnowledgeInfo} from "~/type/knowledge-info";
import type {SubjectDict} from "~/util/subject-dict";
import type {HierarchicalDict} from "~/util/hierarchical-dict";

// math_pep_junior_71_chapter 1_1_2
export function CommonBreadcrumb(
  subjectDict: SubjectDict,
  catalogDict: HierarchicalDict<Catalog>,
  knowledgeInfoDict: HierarchicalDict<KnowledgeInfo>,
  pathname: string,
  leftMenuSelectKey: string,
  leftMenuSelectKeyPath: string[]
) {
  let breadcrumbList: BreadcrumbItemType[] = []

  // subjectDict
  const prefixKey = StringValidator.endsWith(pathname, StringConst.chapter)
    ? StringUtil.getFirstPart(pathname, StringConst.chapter)
    : StringUtil.getFirstPart(pathname, StringConst.knowledge);
  const [math, pep, junior, grade] = prefixKey.split('_');
  const [subjectKey = "", publisherKey = "", stageKey = "", textbookOrKnowledgeKey = ""] = [
    math,
    `${math}_${pep}`,
    `${math}_${pep}_${junior}`,
    `${math}_${pep}_${junior}_${grade}`
  ];

  const subjectInfo = subjectDict.getSubject(subjectKey);
  if (subjectInfo) {
    breadcrumbList.push({
      title: subjectInfo.label,
    })
  }
  const publisherInfo = subjectDict.getPublisher(subjectKey, publisherKey);
  if (publisherInfo) {
    breadcrumbList.push({
      title: publisherInfo.label,
    })
  }
  const stageInfo = subjectDict.getStage(subjectKey, publisherKey, stageKey);
  if (stageInfo) {
    breadcrumbList.push({
      title: stageInfo.label,
    })
  }
  if (StringValidator.endsWith(pathname, StringConst.chapter)) {
    breadcrumbList.push({
      title: StringConst.chapterDesc,
    });

    const textbookInfo = subjectDict.getTextbook(subjectKey, publisherKey, stageKey, textbookOrKnowledgeKey);
    if (textbookInfo) {
      breadcrumbList.push({
        title: textbookInfo.label,
      })
    }
  } else {
    breadcrumbList.push({
      title: StringConst.knowledgeDesc,
    });

    const knowledgeInfo = subjectDict.getKnowledge(subjectKey, publisherKey, stageKey, textbookOrKnowledgeKey);
    if (knowledgeInfo) {
      breadcrumbList.push({
        title: knowledgeInfo.label,
      })
    }
  }

  if (StringValidator.endsWith(pathname, StringConst.chapter)) {
    const [first = "", second = "", third = ""] = leftMenuSelectKey.split('_');
    const [firstKey, secondKey, thirdKey] = [
      first,
      `${first}_${second}`,
      `${first}_${second}_${third}`
    ];
    fillCatalogOrKnowledgeInfo(breadcrumbList, catalogDict, firstKey, secondKey, thirdKey);
  } else if (StringValidator.endsWith(pathname, StringConst.knowledge)) {
    let firstKey = "", secondKey = "", thirdKey = "";
    if (leftMenuSelectKeyPath.length == 3) {
      firstKey = leftMenuSelectKeyPath[2];
      secondKey = leftMenuSelectKeyPath[1];
      thirdKey = leftMenuSelectKeyPath[0];
    } else if (leftMenuSelectKeyPath.length == 2) {
      firstKey = leftMenuSelectKeyPath[1];
      secondKey = leftMenuSelectKeyPath[0];
    } else if (leftMenuSelectKeyPath.length == 1) {
      firstKey = leftMenuSelectKeyPath[0];
    }
    fillCatalogOrKnowledgeInfo(breadcrumbList, knowledgeInfoDict, firstKey, secondKey, thirdKey);
  } else {
    return <Breadcrumb items={breadcrumbList}/>
  }

  return <Breadcrumb items={breadcrumbList}/>
}

function fillCatalogOrKnowledgeInfo(
  breadcrumbList: BreadcrumbItemType[],
  commonDict: any,
  firstKey: string,
  secondKey: string,
  thirdKey: string,
) {
  const firstInfo = commonDict.getFirst(firstKey);
  if (firstInfo) {
    breadcrumbList.push({
      title: firstInfo.label,
    });
  }
  const secondInfo = commonDict.getSecond(firstKey, secondKey);
  if (secondInfo) {
    breadcrumbList.push({
      title: secondInfo.label,
    });
  }
  const thirdInfo = commonDict.getThird(firstKey, secondKey, thirdKey);
  if (thirdInfo) {
    breadcrumbList.push({
      title: thirdInfo.label,
    });
  }
}
