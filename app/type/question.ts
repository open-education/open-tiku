// 题目列表搜索字段维护
export interface QuestionSearch {
  twoLevelId: number; // 第2层标识-用于查询题目类型和标签
  fiveLevelId: number; // 第5层标识-用于获取知识点分类和教材目录
  fiveLevelSelectKeys: string[]; // 选择的5层菜单导航key列表
  eightIds: number[]; // 第8层标识-用于查询该题型下的题目列表
  eightLevelSelectKeys: string[]; // 题目分类类表导航key集合
  typeId: number; // 题目类型
  tagIds: number[]; // 题目标签
  dimensionIds: number[]; //核心素养
  levelIds: number[]; // 分层体系
  sceneIds: number[]; // 适用场景
  mistakeTipIds: number[]; // 常见错误
  id?: number; // 题目主键
  sourceId?: number; // 母题标识, 添加变式题时需要传递
  status?: number; // 题目状态
}

// 题目列表请求
export interface QuestionListReq {
  source: string;
  questionCateIds: number[];
  questionTypeId?: number;
  ids?: number[];
  status?: number; // 题目状态, 我的题目能看全部状态
  titleVal?: string;
  tagIds?: number[];
  dimensionIds?: number[];
  levelIds?: number[];
  sceneIds?: number[];
  mistakeTipIds?: number[];
  pageNo: number;
  pageSize: number;
}

// 题目选项信息
export interface QuestionOption {
  label: string; // A, B, C, D, E
  content: string; // 选项内容
  images?: string[]; // 图片列表
  order: number; // 顺序
}

// 解题分析
export interface Content {
  content: string; // 分析内容
  images?: string[]; // 图片
}

// 解题步骤
export interface Step {
  id: number; // 步骤
  content: string; // 内容
}

// 题目基本信息返回
export interface QuestionBaseInfoResp {
  id: number;
  questionCateId: number;
  questionTypeId: number;
  questionTagIds?: number[];
  questionDimensionIds?: number[];
  levelId: number;
  sceneIds?: number[];
  mistakeTipIds?: number[];
  relationType: number;
  authorId?: number;
  authorName?: string;
  originalName: string;
  source?: string;
  status: number;
  title: string;
  contentPlain: string;
  comment?: string;
  difficultyLevel: number;
  images?: string[];
  options?: QuestionOption[];
  optionsLayout?: number;
  steps?: Step[];
  approveName: string;
  rejectReason?: string; // 拒绝原因
  approveAt?: string; // 审核时间
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

// 题目列表返回
export interface QuestionListResp {
  pageNo: number;
  pageSize: number;
  total: number;
  list: QuestionBaseInfoResp[];
}

// 题目搜索页面
export interface QuestionPageSourceProps {
  // 页面来源 list: 普通的搜索列表 myQuestion: 我的题目, 只有查看和编辑 myReview: 我的审核 只有查看
  source: 'list' | 'myQuestion' | 'myReview';
}

// 题目其它信息返回
export interface QuestionExtraInfoResp {
  answer?: string;
  knowledge?: string;
  analysis?: Content;
  process?: Content;
  remark?: string;
}

// 题目详情信息返回
export interface QuestionInfoResp {
  baseInfo: QuestionBaseInfoResp;
  extraInfo: QuestionExtraInfoResp;
}

// 题目变式题列表请求
export interface QuestionSimilarListReq {
  questionId: number;
  questionCateId: number;
  questionTypeId?: number;
  tagIds?: number[];
  pageNo: number;
  pageSize: number;
}
