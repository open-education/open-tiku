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

  // 移动数组内的元素, 拖拽时从 oldIndex 拖拽到 newIndex 位置
  moveArrayItem: <T>(arr: T[], oldIndex: number, newIndex: number): T[] => {
    // 边界校验：索引相同、越界 或 数组为空时，直接返回原数组副本
    if (oldIndex === newIndex || !arr.length || oldIndex < 0 || newIndex < 0 || oldIndex >= arr.length || newIndex >= arr.length) {
      return [...arr];
    }

    // 创建副本（避免修改原数组）
    const newArr = [...arr];

    // 先移除旧位置的元素（此时数组长度减 1，后续元素自动前移）
    const [movedItem] = newArr.splice(oldIndex, 1);

    // 再插入到新位置（splice 会自动根据当前长度处理插入点）
    newArr.splice(newIndex, 0, movedItem);

    return newArr;
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
