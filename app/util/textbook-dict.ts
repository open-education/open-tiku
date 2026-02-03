import type { Textbook } from "~/type/textbook";
import { StringConst } from "./string";

/**
 * 构建 ID 到 完整节点路径数组 的映射
 * @param data 原始树形数据
 * @returns Map<string, Textbook[]>
 */
export const createTextbookPathDict = (data: Textbook[]): Map<string, Textbook[]> => {
  const pathMap = new Map<string, Textbook[]>();

  const traverse = (items: Textbook[], ancestors: Textbook[] = []) => {
    for (const item of items) {
      // 当前节点的完整路径 = 父辈路径 + 自身
      const currentPath = [...ancestors, item];

      // 存入 Map：key 为当前节点 id，value 为从根到自身的数组, 但是题型表的id可能跟菜单表的id重复, 所以题型表的id要特殊处理下
      let key = item.id.toString();
      if (item.tableName && item.tableName == StringConst.questionCateTableName) {
        key = item.id + StringConst.dictPath;
      }
      pathMap.set(key, currentPath);

      // 递归子节点
      if (item.children && item.children.length > 0) {
        traverse(item.children, currentPath);
      }
    }
  };

  traverse(data);

  return pathMap;
};
