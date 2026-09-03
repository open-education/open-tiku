import type { TopPaperReq, TopPaperResp } from "~/type/paper";
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

// 对象工具
export const ObjectUtil = {
  // 将精选试卷返回结构转为请求结构, 编辑详情时需要
  toTopPaperReq: (resp: TopPaperResp): TopPaperReq => ({
    common: { ...resp.common },
    groups: resp.groups.map((group) => ({
      ...group.common,
      questions: group.questions.map((q) => ({ ...q })),
    })),
  }),

  // 处理错误类型
  isError: (error: unknown): error is Error => {
    return error instanceof Error;
  },

  // 生成一个随机字符
  getRandomStr: (): string => {
    return Math.random().toString(36).substring(2, 9);
  },
};

// 日期相关工具
export const DateUtil = {
  getTodayDate: (): { startDate: string; endDate: string } => {
    const today = new Date();

    const formatDate = (date: Date): string => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    // 计算明天
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return {
      startDate: formatDate(today),
      endDate: formatDate(tomorrow),
    };
  },

  // 获取前n天的日期, endDate 是今天的日期
  getLastPrevDays: (prev: number = 10): { startDate: string; endDate: string } => {
    const today = new Date();

    const formatDate = (date: Date): string => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    // 1. 因为后端是 < endDate，传今天正好能彻底排除今天的数据
    const endDate = formatDate(today);

    // 2. 开始日期为今天的 n 天前
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - prev);
    const startDate = formatDate(tenDaysAgo);

    return {
      startDate,
      endDate,
    };
  },

  // 字符串格式的日期是否是今天的日期, 不需要严格去处理时区, 就按用户电脑默认时区即可
  isTodayLocal: (dateStr: string): boolean => {
    const today = new Date();

    // 1. 获取用户电脑本地的年、月、日并补零
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayStr = `${yyyy}-${mm}-${dd}`;

    // 2. 直接进行字符串全等比对
    return dateStr === todayStr;
  },
};
