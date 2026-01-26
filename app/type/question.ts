// 题目选项信息
export interface QuestionOption {
  label: string; // A, B, C, D, E
  content: string; // 选项内容
  images?: string[]; // 图片列表
  order: number; // 顺序
}

// 解题分析
export interface Content {
  content: string;
  images?: string[];
}

// 题目基本信息详情
export interface QuestionBaseInfo {
  id: number;
  questionCateId: number;
  sourceId?: number;
  questionTypeId: number;
  questionTagIds?: number[];
  authorId?: number;
  title: string;
  contentPlain: string;
  comment: string;
  difficultyLevel: number;
  images?: string[];
  options?: QuestionOption[];
  optionsLayout?: number;
  answer?: string;
  knowledge?: string;
  analysis?: Content;
  process?: Content;
  remark?: string;
}

// 创建题目请求
export interface CreateQuestionReq {
  sourceId?: number;
  questionCateId: number;
  questionTypeId: number;
  questionTagIds?: number[];
  title: string;
  comment?: string;
  difficultyLevel: number;
  images?: string[];
  options?: QuestionOption[];
  optionsLayout?: number;
  answer?: string;
  knowledge?: string;
  analysis?: Content;
  process?: Content;
  remark?: string;
}

// 题目基本信息返回
export interface QuestionBaseInfoResp {
  id: number;
  questionCateId: number;
  questionTypeId: number;
  questionTagIds?: number[];
  authorId?: number;
  title: string;
  contentPlain: string;
  comment: string;
  difficultyLevel: number;
  images?: string[];
  options?: QuestionOption[];
  optionsLayout?: number;
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
