import { Breadcrumb } from "antd";
import React from "react";
import type { BreadcrumbItemType } from "antd/lib/breadcrumb/Breadcrumb";
import type { Textbook } from "~/type/textbook";

// 面包屑导航
export function CommonBreadcrumb(pathMap: Map<number, Textbook[]>, pathname: string, childPathMap: Map<number, Textbook[]>, questionCateId: number) {
  let breadcrumbList: BreadcrumbItemType[] = [];

  // 前5层级
  const nodeId: number = Number(pathname ?? 0);
  if (nodeId <= 0) {
    return "";
  }

  const nodes: Textbook[] = pathMap.get(nodeId) ?? [];
  if (nodes && nodes.length > 0) {
    for (let i = 0; i < nodes.length; i++) {
      breadcrumbList.push({
        title: nodes[i].label,
      });
    }
  }

  // 后3层级
  const childNodeId: number = Number(questionCateId ?? 0);
  if (childNodeId <= 0) {
    return <Breadcrumb items={breadcrumbList} />;
  }

  const childNodes: Textbook[] = childPathMap.get(childNodeId) ?? [];
  if (childNodes && childNodes.length > 0) {
    for (let i = 0; i < childNodes.length; i++) {
      breadcrumbList.push({
        title: childNodes[i].label,
      });
    }
  }

  return <Breadcrumb items={breadcrumbList} />;
}
