import type { TextbookOtherDict } from "./textbook";

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

// 创建题目请求
export interface CreateQuestionReq {
  id?: number; // 更新时需要主键, 新增时不能传递这个key
  sourceId?: number; // 母题标识, 默认无
  questionCateId: number; // 题目分类标识
  questionTypeId: number; // 题目类型标识
  questionTagIds?: number[]; // 题目标签
  originalName: string; // 原创者代号-不要写别人真名, 尊重他人隐私
  source?: string; // 题目来源
  title: string; // 题干
  comment?: string; // 题干补充说明
  difficultyLevel: number; // 难度系数
  images?: string[]; // 题干图片
  options?: QuestionOption[]; // 选择题选项列表
  optionsLayout?: number; // 选择题选项布局样式 1 展示一行 2 展示一列 3 展示两列
  answer?: string; // 参考答案
  knowledge?: string; // 涉及知识点
  analysis?: Content; // 解题分析
  process?: Content; // 解题过程
  steps?: Step[]; // 解题步骤提示
  remark?: string; // 解题备注, 比如易错题型等
  status: number; // 题目状态
}

// 题目基本信息返回
export interface QuestionBaseInfoResp {
  id: number;
  questionCateId: number;
  questionTypeId: number;
  questionTagIds?: number[];
  authorId?: number;
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

// 题目列表请求
export interface QuestionListReq {
  questionCateId: number;
  questionTypeId?: number;
  ids?: number[];
  titleVal?: string;
  tagIds?: number[];
  pageNo: number;
  pageSize: number;
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

// 题目列表返回
export interface QuestionListResp {
  pageNo: number;
  pageSize: number;
  total: number;
  list: QuestionBaseInfoResp[];
}

// 题目列表搜索字段维护
export interface QuestionSearch {
  twoLevelId: number; // 第2层标识-用于查询题目类型和标签
  fiveLevelId: number; // 第5层标识-用于获取知识点分类和教材目录
  fiveLevelSelectKeys: string[]; // 选择的5层菜单导航key列表
  eightId: number; // 第8层标识-用于查询该题型下的题目列表
  eightLevelSelectKeys: string[]; // 题目分类类表导航key集合
  typeId: number; // 题目类型
  tagIds: number[]; // 题目标签
  id: number; // 题目主键
  sourceId?: number; // 母题标识, 添加变式题时需要传递
}

// 解析题目请求
export interface QuestionSnippetReq {
  typeList: TextbookOtherDict[];
  tagList: TextbookOtherDict[];
  content: string;
}
