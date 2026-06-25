// 字符串验证工具类
export const StringValidator = {
  // 检查是否为非空字符串
  isNonEmpty: (str: any): str is string => typeof str === "string" && str.length > 0,

  // 检查是否为非空白字符串
  isNonWhitespace: (str: any): str is string => typeof str === "string" && str.trim().length > 0,

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
  },
};

export const StringUtil = {
  getFirstPart: (str: string | undefined, separator: string = "_"): string => {
    return str === undefined ? "" : str.split(separator)[0] || "";
  },

  getLastPart: (str: string | undefined, separator: string = "_"): string => {
    if (str === undefined) return "";
    const lastIndex = str.lastIndexOf(separator);
    return lastIndex === -1 ? str : str.slice(lastIndex + 1);
  },

  removeLastPart: (str: string | undefined, separator: string = "_"): string => {
    if (str === undefined) return "";
    const lastUnderscoreIndex = str.lastIndexOf(separator);
    if (lastUnderscoreIndex === -1) {
      return "";
    }
    return str.substring(0, lastUnderscoreIndex);
  },

  getRandomInt: (min: number = 1, max: number = 500): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

// 部分字符串常量维护
export const StringConst = {
  // 每页显示数据条数
  pageSize: 10,
  // 题目列表题型选择 全部 标识
  listSelectAll: 0,
  listSelectAllDesc: "全部",

  // 我要组卷
  // 题目来源
  tiKuChapterOrKnowledgeSourceVal: "1", // 教材章节或知识点
  tikuMy: "2", // 我的题库
  tikuMyBox: "3", // 我的试题篮
  tikuMaxNum: 30, // 每种题型最多选择题目数量

  questionCateTableName: "question_cate", // 题型表
  dictPath: "_cate", // 面包屑字典路径

  taskTypeUploadQuestion: 1, // 任务类型是上传题目

  // 试卷不做过多的东西, 标签直接记录固定即可, 如果需要手动维护即可
  // 试卷标签
  examTags: ["高考", "中考", "小升初", "期末", "月考", "会考"],
  // 每种标签对应的样式
  examTagClass: new Map<string, string>([
    ["高考", "bg-red-50 text-red-700 border-red-100"],
    ["中考", "bg-orange-50 text-orange-700 border-orange-100"],
    ["小升初", "bg-sky-50 text-sky-700 border-sky-100"],
    ["期末", "bg-emerald-50 text-emerald-700 border-emerald-100"],
    ["月考", "bg-violet-50 text-violet-700 border-violet-100"],
    ["会考", "bg-amber-50 text-amber-700 border-amber-100"],
  ]),
  // 预设题型数量最多10个题型
  groupNumberMap: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
  // 预设选项最多5个选项
  optionLabels: ["A", "B", "C", "D", "E", "F"],
  // 题目难度系数配置
  difficultyLevelList: [
    { value: 1, label: "1" },
    { value: 1.5, label: "1.5" },
    { value: 2, label: "2" },
    { value: 2.5, label: "2.5" },
    { value: 3, label: "3" },
    { value: 3.5, label: "3.5" },
    { value: 4, label: "4" },
    { value: 4.5, label: "4.5" },
    { value: 5.0, label: "5" },
  ],
  // 选项布局
  selectLayoutList: [
    { id: "select_layout_list_1", value: 1, label: "展示一列" },
    { id: "select_layout_list_2", value: 2, label: "展示两列" },
    { id: "select_layout_list_3", value: 3, label: "展示四列" },
  ],
  // 题目审核状态
  questionStatusList: [
    { id: 1, value: 0, label: "草稿中" },
    { id: 2, value: 1, label: "待审核" },
    { id: 3, value: 2, label: "已发布" },
    { id: 4, value: 3, label: "已拒绝" },
  ],
};

// 字符串常量工具
export const StringConstUtil = {
  getExamTagClass: (tag: string): string => {
    return StringConst.examTagClass.get(tag) || "";
  },
};
