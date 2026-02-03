import { Breadcrumb } from "antd";
import type { BreadcrumbItemType } from "antd/lib/breadcrumb/Breadcrumb";
import type { Textbook } from "~/type/textbook";
import { StringConst } from "~/util/string";

// 面包屑导航
export function CommonBreadcrumb(
  pathMap: Map<string, Textbook[]>,
  pathname: string,
  childPathMap: Map<string, Textbook[]>,
  questionCateId: number,
  cateKeyPath: string[],
) {
  let breadcrumbList: BreadcrumbItemType[] = [];

  // 前5层级
  const nodeId: number = Number(pathname ?? 0);
  if (nodeId <= 0) {
    return "";
  }

  const nodes: Textbook[] = pathMap.get(nodeId.toString()) ?? [];
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

  let qId = childNodeId.toString();
  if (cateKeyPath.length == 3) {
    // 第三级才拼接后缀
    qId = childNodeId.toString() + StringConst.dictPath;
  }

  const childNodes: Textbook[] = childPathMap.get(qId) ?? [];
  if (childNodes && childNodes.length > 0) {
    for (let i = 0; i < childNodes.length; i++) {
      breadcrumbList.push({
        title: childNodes[i].label,
      });
    }
  }

  return <Breadcrumb items={breadcrumbList} />;
}
