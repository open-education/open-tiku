import {Breadcrumb} from "antd";
import React from "react";
import type {Subject} from "~/type/guidance";
import type {Catalog} from "~/type/catalog";
import {StringConst, StringUtil, StringValidator} from "~/util/string";
import type {BreadcrumbItemType} from "antd/lib/breadcrumb/Breadcrumb";
import type {KnowledgeInfo} from "~/type/knowledge-info";

// todo 后面转为字典或者缓存后在优化
// math_pep_junior_71_chapter 1_1_2
export function CommonBreadcrumb(
    subjectList: Subject[],
    catalogList: Catalog[],
    knowledgeInfoList: KnowledgeInfo[],
    pathname: string,
    leftMenuSelectKey: string,
) {
    let breadcrumbList: BreadcrumbItemType[] = []

    // subjectList
    for (let i = 0; i < subjectList.length; i++) {
        const subject = subjectList[i];
        if (StringValidator.startsWith(pathname, subject.key)) {
            breadcrumbList.push({
                title: subject.label
            })
            const publisherChildren = subject.children ?? [];
            if (publisherChildren.length === 0) {
                break;
            }
            for (let j = 0; j < publisherChildren.length; j++) {
                const publisher = publisherChildren[j];
                if (StringValidator.startsWith(pathname, publisher.key)) {
                    breadcrumbList.push({
                        title: publisher.label,
                    })
                    const stageChildren = publisher.children ?? [];
                    if (stageChildren.length == 0) {
                        break;
                    }
                    for (let k = 0; k < stageChildren.length; k++) {
                        const stage = stageChildren[k];
                        if (StringValidator.startsWith(pathname, stage.key)) {
                            breadcrumbList.push({
                                title: stage.label,
                            })
                            if (StringValidator.endsWith(pathname, StringConst.chapter)) {
                                const textbooks = stage.textbookList ?? [];
                                breadcrumbList.push({
                                    title: StringConst.chapterDesc
                                });
                                for (let g = 0; g < textbooks.length; g++) {
                                    const textbook = textbooks[g];
                                    if (StringValidator.startsWith(pathname, textbook.key)) {
                                        breadcrumbList.push({
                                            title: textbook.label,
                                        })
                                        break;
                                    }
                                }
                            } else if (StringValidator.endsWith(pathname, StringConst.knowledge)) {
                                const knowledgeInfoList = stage.knowledgeList ?? [];
                                for (let h = 0; h < knowledgeInfoList.length; h++) {
                                    const knowledge = knowledgeInfoList[h];
                                    breadcrumbList.push({
                                        title: StringConst.knowledgeDesc
                                    });
                                    if (StringValidator.startsWith(pathname, knowledge.key)) {
                                        breadcrumbList.push({
                                            title: knowledge.label,
                                        })
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                    break;
                }
            }
            break;
        }
    }

    // catalogList
    if (StringValidator.endsWith(pathname, StringConst.chapter) && catalogList.length > 0) {
        for (let i = 0; i < catalogList.length; i++) {
            const first = catalogList[i];
            if (StringValidator.startsWith(leftMenuSelectKey, first.key)) {
                breadcrumbList.push({
                    title: first.label
                });
                const secondList = first.children ?? [];
                if (secondList.length == 0) {
                    break;
                }
                for (let j = 0; j < secondList.length; j++) {
                    const second = secondList[j];
                    if (StringValidator.startsWith(leftMenuSelectKey, second.key)) {
                        breadcrumbList.push({
                            title: second.label,
                        })
                        const thirdList = second.children ?? [];
                        if (thirdList.length == 0) {
                            break;
                        }
                        for (let j = 0; j < thirdList.length; j++) {
                            const third = thirdList[j];
                            if (StringValidator.startsWith(leftMenuSelectKey, third.key)) {
                                breadcrumbList.push({
                                    title: third.label,
                                })
                                break;
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }
    }

    // knowledge
    if (StringValidator.endsWith(pathname, StringConst.knowledge) && knowledgeInfoList.length > 0) {
        for (let i = 0; i < knowledgeInfoList.length; i++) {
            const first = knowledgeInfoList[i];
            if (StringValidator.startsWith(leftMenuSelectKey, StringUtil.getLastPart(first.key))) {
                breadcrumbList.push({
                    title: first.label
                });
                const secondList = first.children ?? [];
                if (secondList.length == 0) {
                    break;
                }
                for (let j = 0; j < secondList.length; j++) {
                    const second = secondList[j];
                    if (StringValidator.startsWith(leftMenuSelectKey, second.key)) {
                        breadcrumbList.push({
                            title: second.label,
                        })
                        const thirdList = second.children ?? [];
                        if (thirdList.length == 0) {
                            break;
                        }
                        for (let j = 0; j < thirdList.length; j++) {
                            const third = thirdList[j];
                            if (StringValidator.startsWith(leftMenuSelectKey, third.key)) {
                                breadcrumbList.push({
                                    title: third.label,
                                })
                                break;
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }
    }

    return <Breadcrumb items={breadcrumbList}/>
}
