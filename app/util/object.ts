import type { OtherDictListRecord, TextbookOtherDictListResp, TextbookOtherDictResp, TextbookResp } from '@/type/textbook';
import { StringConst } from '@/util/string';

// 对象工具
export const ObjectUtil = {
  // 处理错误类型
  isError: (error: unknown): error is Error => {
    return error instanceof Error;
  },
};

// 章节考点数据处理工具
export const TextbookUtil = {
  /**
   * 构建 ID 到 完整节点路径数组 的映射
   * @param data 原始树形数据
   * @returns Map<string, Textbook[]>
   */
  createTextbookPathDict: (data: TextbookResp[]): Map<string, TextbookResp[]> => {
    const pathMap = new Map<string, TextbookResp[]>();

    const traverse = (items: TextbookResp[], ancestors: TextbookResp[] = []) => {
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
  },

  // 处理教材所有的标签
  createOtherDictListRecord: (dictListResp: TextbookOtherDictListResp): OtherDictListRecord => {
    let questionTypes = dictListResp.map['question_type'] || [];
    let questionTypeDict = ArrayUtil.arrayToDict(questionTypes, 'id');

    let questionTags = dictListResp.map['question_tag'] || [];
    let questionTagDict = ArrayUtil.arrayToDict(questionTags, 'id');

    let questionDimensions = dictListResp.map['question_dimension'] || [];
    let questionDimensionDict = ArrayUtil.arrayToDict(questionDimensions, 'id');

    let questionLevels = dictListResp.map['question_level'] || [];
    let questionLevelDict = ArrayUtil.arrayToDict(questionLevels, 'id');

    let questionScenes = dictListResp.map['question_scene'] || [];
    let questionSceneDict = ArrayUtil.arrayToDict(questionScenes, 'id');

    let questionMistakeTips = dictListResp.map['question_mistake_tip'] || [];
    let questionMistakeTipDict = ArrayUtil.arrayToDict(questionMistakeTips, 'id');

    return {
      questionTypes,
      questionTypeDict,
      questionTags,
      questionTagDict,
      questionDimensions,
      questionDimensionDict,
      questionLevels,
      questionLevelDict,
      questionScenes,
      questionSceneDict,
      questionMistakeTips,
      questionMistakeTipDict,
    };
  },
};

// 数组相关操作工具
export const ArrayUtil = {
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
  getItemValue: (id: number, dict: Record<number, TextbookOtherDictResp>): string => {
    return dict[id]?.itemValue ?? '';
  },

  getItemValues: (ids: number[], dict: Record<number, TextbookOtherDictResp>): string[] => {
    return ids.map((id) => dict[id]?.itemValue).filter((name): name is string => name !== undefined);
  },
};
