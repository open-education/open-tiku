import type { StudentAccountParseResult } from '@/type/class';
import type { CustomResp } from '@/type/custom';
import { CustomModeType, CustomType, TextbookFillLevelType } from '@/type/enum';
import type { OtherDictListRecord, TextbookOtherDictListResp, TextbookOtherDictResp, TextbookResp } from '@/type/textbook';
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

  // 根据列表判断应该写入章节还是知识点
  textbookPathUpdate: (
    items: TextbookResp[],
    update?: (key: 'chapterPath' | 'knowledgePath', val: string) => void,
    setFiveLevelId?: (val: number) => void,
    setTwoLevelId?: (val: number) => void,
  ) => {
    if (!items || items.length === 0) return;

    if (update) {
      // 使用 .at(-1) 安全获取最后一个节点
      const lastItem = items.at(-1);
      const path = lastItem ? `${lastItem.path}/${lastItem.id}/` : '';

      // 章节和知识点只能存在其中之一
      if (lastItem?.pathType === 'knowledge') {
        update?.('knowledgePath', path);
        update?.('chapterPath', '');
      } else {
        update?.('chapterPath', path);
        update?.('knowledgePath', '');
      }
    }

    // 更新第5层菜单标识, 最多也只有第5层
    setTwoLevelId?.(items.length >= 2 ? items[1].id : 0);
    setFiveLevelId?.(items.length === 5 ? items[items.length - 1].id : 0);
  },

  // 试卷更新菜单完整路径
  paperTextbookPathUpdate: (items: TextbookResp[], update: (key: 'textbookPath', val: string) => void) => {
    if (!items || items.length === 0) return;

    const idFullPath = items.length > 0 ? `/${items.map((item) => item.id).join('/')}/` : '';

    update('textbookPath', idFullPath);
  },

  // 通过路径获取指定标识, 如果不足最大深度则获取末级标识
  getPathId: (path: string, deep: number): number => {
    const paths = path?.split('/').filter(Boolean);
    if (!paths || paths.length === 0) return 0;

    // 达到深度则获取指定深度的标识id（deep 从 1 开始计数，对应索引 deep - 1）
    const target = deep > 0 && paths.length >= deep ? paths[deep - 1] : paths[paths.length - 1];
    const id = Number(target);

    return Number.isNaN(id) ? 0 : id;
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

  // 针对一定的结构获取对应的描述值
  // 对比的值是 value 返回的是 label
  getOptionLabel(options: readonly { value: number | string; label: string }[], status: number | string, fallback = '未知状态'): string {
    return options.find((item) => item.value === status)?.label ?? fallback;
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
  // 如果约定的更新键一致则直接使用即可-初始页面个性化配置覆盖
  defaultTextbookUpdate: (
    listResp: CustomResp[],
    updateFillLevel: (key: 'fiveLevelKeys', val: string[]) => void, // 填充前5层菜单默认选中
    update?: (key: 'chapterPath' | 'knowledgePath', val: string) => void, // 更新第5层菜单对应的完整路径
    setFiveLevelId?: (val: number) => void, // 指定第5层标识, 需要触发后3层菜单列表
    setTwoLevelId?: (val: number) => void, // 指定第2层标识, 比如题型等通用字典
  ) => {
    const textbook = listResp.find((item) => item.customType === CustomType.Textbook)?.textbook;
    if (!textbook) return;

    const { keys, mode, path = '' } = textbook;

    if (keys?.length) {
      updateFillLevel('fiveLevelKeys', keys);
    }

    // 需要更新才执行更新
    if (update) {
      switch (mode) {
        case CustomModeType.Chapter:
          update?.('chapterPath', path);
          break;
        case CustomModeType.Knowledge:
          update?.('knowledgePath', path);
          break;
      }
    }

    // 如果需要更新第5层菜单标识, 比如需要拉取默认的题型列表
    setTwoLevelId?.(Number(path?.split('/').filter(Boolean).at(1)) || 0);
    setFiveLevelId?.(Number(path?.split('/').filter(Boolean).at(4)) || 0);
  },

  // 如果约定的更新键一致则直接使用即可-初始页面个性化配置覆盖
  defaultPaperTextbookUpdate: (
    listResp: CustomResp[],
    updateFillLevel: (key: 'fiveLevelKeys', val: string[]) => void,
    update: (key: 'textbookPath', val: string) => void,
  ) => {
    const textbook = listResp.find((item) => item.customType === CustomType.Textbook)?.textbook;
    if (!textbook) return;

    const { keys, mode, path = '' } = textbook;

    if (keys?.length) {
      updateFillLevel('fiveLevelKeys', keys);
    }

    update('textbookPath', path);
  },

  // 如果约定的更新键一致则直接使用即可-编辑时覆盖
  editInitTextbookUpdate: (
    level: TextbookFillLevelType,
    levelId: number,
    dict: Map<string, TextbookResp[]>,
    updateFillLevel: (key: 'fiveLevelKeys' | 'eightLevelKeys', val: string[]) => void,
  ) => {
    if (level === TextbookFillLevelType.Five) {
      const nodes = dict.get(levelId.toString()) || [];
      const keys = nodes.map((node) => node.key);
      updateFillLevel('fiveLevelKeys', keys);
    } else if (level === TextbookFillLevelType.Eight) {
      const key = `${levelId}${StringConst.dictPath}`;
      const nodes = dict.get(key) || [];
      const keys = nodes.map((node) => node.key);
      updateFillLevel('eightLevelKeys', keys);
    }
  },
};
