import type { StudentAccountParseResult } from '@/type/class';
import type { CustomResp } from '@/type/custom';
import { CustomType, TextbookFillLevelType } from '@/type/enum';
import type { CreateQuestionReq, QuestionSearch } from '@/type/question';
import type { TaskListReq, TaskSaveReq } from '@/type/task';
import type { OtherDictListRecord, TextbookFillLevel, TextbookOtherDictListResp, TextbookOtherDictResp, TextbookResp } from '@/type/textbook';
import { StringConst } from '@/util/string';

// 对象工具
export const ObjectUtil = {
  // 处理错误类型
  isError: (error: unknown): error is Error => {
    return error instanceof Error;
  },

  // 格式化当前时间
  getFormatNow: (): string => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    return `${date} ${time}`;
  },

  // 解析学生账户
  getStudentAccount: (input: string): StudentAccountParseResult => {
    // 1. 按行分割，清洗，过滤空行
    const lines = input.split('\n');
    const cleaned = lines.map((line) => line.trim()).filter((line) => line !== '');

    // 2. 统计出现次数
    const countMap = new Map<string, number>();
    cleaned.forEach((account) => {
      countMap.set(account, (countMap.get(account) || 0) + 1);
    });

    // 3. 找出重复项（出现次数 > 1）
    const duplicates = Array.from(countMap.entries())
      .filter(([_, count]) => count > 1)
      .map(([account]) => account);

    // 4. 逗号拼接
    const commaSeparated = cleaned.join(',');

    return {
      cleaned: cleaned,
      commaSeparated,
      duplicates,
    };
  },

  // 格式化文件尺寸
  formatFileSize: (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  // 根据当前日期创建一个 id 有概率重复
  createId: (): string => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  },

  // 字符串转为数字, 失败时返回0
  strToNumber: (raw: string | null): number => {
    const num = raw && raw.trim() !== '' ? Number(raw) : undefined;
    return num !== undefined && Number.isFinite(num) && num > 0 ? num : 0;
  },
};

// 章节知识点数据处理工具
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

// 个性化配置工具
export const CustomUtil = {
  // 题目搜索个性化更新
  questionSearchUpdate: (listResp: CustomResp[], update: (key: keyof QuestionSearch, value: number | number[] | string[]) => void) => {
    // 如果存在预设默认值则覆盖初始化值
    const customTextbook = listResp.find((item) => item.customType === CustomType.Textbook);
    if (!customTextbook) {
      return;
    }

    if (customTextbook.textbook) {
      if (customTextbook.textbook.twoLevelId && customTextbook.textbook.twoLevelId > 0) {
        update('twoLevelId', customTextbook.textbook.twoLevelId);
      }
      if (customTextbook.textbook.fiveLevelId && customTextbook.textbook.fiveLevelId > 0) {
        update('fiveLevelId', customTextbook.textbook.fiveLevelId);
      }
      if (customTextbook.textbook.fiveLevelKeys && customTextbook.textbook.fiveLevelKeys.length > 0) {
        update('fiveLevelSelectKeys', customTextbook.textbook.fiveLevelKeys);
      }
    }
  },

  // 题目添加个性化更新
  questionAddUpdate: (
    listResp: CustomResp[],
    updateAddReq: (key: keyof CreateQuestionReq, value: number | number[] | string | string[]) => void,
    updateFillLevel: (key: keyof TextbookFillLevel, val: string[]) => void,
  ) => {
    // 如果存在预设默认值则覆盖初始化值
    const customTextbook = listResp.find((item) => item.customType === CustomType.Textbook);
    if (!customTextbook) {
      return;
    }

    if (customTextbook.textbook) {
      if (customTextbook.textbook.twoLevelId && customTextbook.textbook.twoLevelId > 0) {
        updateAddReq('twoLevelId', customTextbook.textbook.twoLevelId);
      }
      if (customTextbook.textbook.fiveLevelId && customTextbook.textbook.fiveLevelId > 0) {
        updateAddReq('fiveLevelId', customTextbook.textbook.fiveLevelId);
      }
      if (customTextbook.textbook.fiveLevelKeys && customTextbook.textbook.fiveLevelKeys.length > 0) {
        updateFillLevel('fiveLevelKeys', customTextbook.textbook.fiveLevelKeys);
      }
    }
  },

  // 题目编辑前5层菜单更新
  questionEditLevelUpdate: (
    level: TextbookFillLevelType,
    dict: Map<string, TextbookResp[]>,
    addReq: CreateQuestionReq,
    updateFillLevel: (key: keyof TextbookFillLevel, val: string[]) => void,
  ) => {
    if (level === TextbookFillLevelType.Five) {
      const nodes = dict.get(addReq.fiveLevelId.toString()) || [];
      const keys = nodes.map((node) => node.key);
      updateFillLevel('fiveLevelKeys', keys);
    } else if (level === TextbookFillLevelType.Eight) {
      const key = `${addReq.questionCateId}${StringConst.dictPath}`;
      const nodes = dict.get(key) || [];
      const keys = nodes.map((node) => node.key);
      updateFillLevel('eightLevelKeys', keys);
    }
  },

  // 题目任务上传菜单更新
  questionTaskUploadUpdate: (
    listResp: CustomResp[],
    updateAddReq: (key: keyof TaskSaveReq, value: number | string) => void,
    updateFillLevel: (key: keyof TextbookFillLevel, val: string[]) => void,
  ) => {
    // 如果存在预设默认值则覆盖初始化值
    const customTextbook = listResp.find((item) => item.customType === CustomType.Textbook);
    if (!customTextbook) {
      return;
    }

    if (customTextbook.textbook) {
      if (customTextbook.textbook.twoLevelId && customTextbook.textbook.twoLevelId > 0) {
        updateAddReq('twoLevelId', customTextbook.textbook.twoLevelId);
      }
      if (customTextbook.textbook.fiveLevelId && customTextbook.textbook.fiveLevelId > 0) {
        updateAddReq('fiveLevelId', customTextbook.textbook.fiveLevelId);
      }
      if (customTextbook.textbook.fiveLevelKeys && customTextbook.textbook.fiveLevelKeys.length > 0) {
        updateFillLevel('fiveLevelKeys', customTextbook.textbook.fiveLevelKeys);
      }
    }
  },

  // 题目任务查看菜单更新
  questionTaskListUpdate: (
    listResp: CustomResp[],
    updateListReq: (key: keyof TaskListReq, value: number | string) => void,
    updateFillLevel: (key: keyof TextbookFillLevel, val: string[]) => void,
  ) => {
    // 如果存在预设默认值则覆盖初始化值
    const customTextbook = listResp.find((item) => item.customType === CustomType.Textbook);
    if (!customTextbook) {
      return;
    }

    if (customTextbook.textbook) {
      if (customTextbook.textbook.twoLevelId && customTextbook.textbook.twoLevelId > 0) {
        updateListReq('twoLevelId', customTextbook.textbook.twoLevelId);
      }
      if (customTextbook.textbook.fiveLevelId && customTextbook.textbook.fiveLevelId > 0) {
        updateListReq('fiveLevelId', customTextbook.textbook.fiveLevelId);
      }
      if (customTextbook.textbook.fiveLevelKeys && customTextbook.textbook.fiveLevelKeys.length > 0) {
        updateFillLevel('fiveLevelKeys', customTextbook.textbook.fiveLevelKeys);
      }
    }
  },
};
