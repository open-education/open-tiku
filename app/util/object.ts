import type { Textbook, TextbookOption, TextbookOtherDict } from "~/type/textbook";

// 数组相关操作工具
export const ArrayUtil = {
  /**
   * 将 Textbook 树形结构转换为 TextbookOption 结构
   */
  mapTextbookToOption: (list: Textbook[]): TextbookOption[] => {
    return list.map((item) => ({
      value: item.key,
      label: item.label,
      // 关键：将原始对象挂载到 raw 字段
      raw: item,
      children: item.children ? ArrayUtil.mapTextbookToOption(item.children) : undefined,
    }));
  },

  // 一维数组转字典
  arrayToDict: <T, K extends keyof T>(array: T[], key: K): Record<T[K] extends PropertyKey ? T[K] : never, T> => {
    return array.reduce((acc, item) => {
      acc[item[key] as any] = item;
      return acc;
    }, {} as any);
  },
};

// 字典相关工具函数
export const DictUtil = {
  getQuestionTypeName: (typeId: number, dict: Record<number, TextbookOtherDict>): string => {
    return dict[typeId]?.itemValue ?? "";
  },

  getQuestionTagNames: (tagIds: number[], dict: Record<number, TextbookOtherDict>): string[] => {
    return tagIds.map((id) => dict[id]?.itemValue).filter((name): name is string => name !== undefined);
  },

  getQuestionDimensionNames: (dimensionIds: number[], dict: Record<number, TextbookOtherDict>): string[] => {
    return dimensionIds.map((id) => dict[id]?.itemValue).filter((name): name is string => name !== undefined);
  },
};
