import type { Textbook, TextbookOption } from "~/type/textbook";

export const ArrayUtil = {
  /**
   * 将 Textbook 树形结构转换为 TextbookOption 结构
   */
  mapTextbookToOption: (list: Textbook[]): TextbookOption[] => {
    return list.map((item) => ({
      value: item.id.toString(),
      label: item.label,
      // 关键：将原始对象挂载到 raw 字段
      raw: item,
      children: item.children
        ? ArrayUtil.mapTextbookToOption(item.children)
        : undefined,
    }));
  },
};
