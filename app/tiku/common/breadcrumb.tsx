import {Breadcrumb} from "antd";
import React from "react";
import type {Subject} from "~/type/guidance";
import type {Catalog} from "~/type/catalog";
import {StringValidator} from "~/util/string";
import type {BreadcrumbItemType} from "antd/lib/breadcrumb/Breadcrumb";

export function CommonBreadcrumb(
    subjectList: Subject[],
    catalogList: Catalog[],
    textbookKey: string,
    catalogKey: string
) {
    let breadcrumbList: BreadcrumbItemType[] = []

    // subjectList
    for (let i = 0; i < subjectList.length; i++) {
        const subject = subjectList[i];
        if (StringValidator.startsWith(textbookKey, subject.key)) {
            breadcrumbList.push({
                title: subject.label
            })
            const stageChildren = subject.children;
            if (!stageChildren || stageChildren.length === 0) {
                break;
            }
            for (let j = 0; j < stageChildren.length; j++) {
                const stage = stageChildren[j];
                if (StringValidator.startsWith(textbookKey, stage.key)) {
                    breadcrumbList.push({
                        title: stage.label,
                    })
                    const textbookChildren = stage.children;
                    if (!textbookChildren || textbookChildren.length == 0) {
                        break;
                    }
                    for (let k = 0; k < textbookChildren.length; k++) {
                        const textbook = textbookChildren[k];
                        if (textbook.key == textbookKey) {
                            breadcrumbList.push({
                                title: textbook.label,
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

    // catalogList
    for (let i = 0; i < catalogList.length; i++) {
        const catalog = catalogList[i];
        if (StringValidator.startsWith(catalogKey, catalog.key)) {
            breadcrumbList.push({
                title: catalog.label
            });
            if (!catalog.children || catalog.children.length == 0) {
                break;
            }
            for (let j = 0; j < catalog.children.length; j++) {
                const info = catalog.children[j];
                if (info.key === catalogKey) {
                    breadcrumbList.push({
                        title: info.label,
                    })
                    break;
                }
            }
            break;
        }
    }

    return <Breadcrumb items={breadcrumbList}/>
}
