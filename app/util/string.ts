// 字符串验证工具类
export const StringValidator = {
  // 检查是否为非空字符串
  isNonEmpty: (str: any) => typeof str === 'string' && str.length > 0,

  // 检查是否为非空白字符串
  isNonWhitespace: (str: any) => typeof str === 'string' && str.trim().length > 0,

  // 检查是否包含特定内容
  contains: (str: any, search: any) => StringValidator.isNonEmpty(str) && str.includes(search),

  // 检查是否以特定内容开头
  startsWith: (str: any, prefix: any) => StringValidator.isNonEmpty(str) && str.startsWith(prefix),

  // 检查是否以特定内容结尾
  endsWith: (str: any, suffix: any) => StringValidator.isNonEmpty(str) && str.endsWith(suffix),

  // 检查长度范围
  isLengthBetween: (str: any, min: any, max: any) => {
    if (!StringValidator.isNonEmpty(str)) return false;
    const length = str.length;
    return length >= min && length <= max;
  }
}

export const StringUtil = {
  getFirstPart: (str: string | undefined, separator: string = '_'): string => {
    return str === undefined ? "" : str.split(separator)[0] || '';
  },

  getLastPart: (str: string | undefined, separator: string = '_'): string => {
    if (str === undefined) return "";
    const lastIndex = str.lastIndexOf(separator);
    return lastIndex === -1 ? str : str.slice(lastIndex + 1);
  },

  removeLastPart: (str: string | undefined, separator: string = '_'): string => {
    if (str === undefined) return "";
    const lastUnderscoreIndex = str.lastIndexOf(separator);
    if (lastUnderscoreIndex === -1) {
      return '';
    }
    return str.substring(0, lastUnderscoreIndex);
  },

  getRandomInt: (min: number = 1, max: number = 500): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export const StringConst = {
  // 教材章节和知识点 textbookKey 拼接后缀
  chapter: "_chapter",
  chapterDesc: "教材章节",
  knowledge: "_knowledge",
  knowledgeDesc: "知识点类",

  // 知识点 catalogKey 拼接符号 #
  knowledgeCatalogKeySep: "#",

  // 题目列表题型选择 全部 标识
  listSelectAll: 0,
  listSelectAllDesc: "全部",
}
