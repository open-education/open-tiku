// 题目选项信息
export interface QuestionOption {
  label: string,               // A, B, C, D, E
  content: string,             // 选项内容
  images?: string[], // 图片列表
  order: number,                  // 顺序
}

// 解题分析
export interface Content {
  content: string,
  images?: string[],
}

// 题目基本信息详情
export interface QuestionBaseInfo {
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
  answer?: string;
  knowledge?: string;
  analysis?: Content;
  process?: Content;
  remark?: string;
}

// 创建题目请求
export interface CreateQuestionReq {
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
  questionCateId: number,
  questionTypeId?: number,
  pageNo: number,
  pageSize: number
}

// 题目列表返回
export interface QuestionListResp {
  pageNo: number,
  pageSize: number
  total: number
  list: QuestionBaseInfoResp[]
}

export interface QuestionType {
  label: string
  key: string
  order: number
}

export interface QuestionInfo_del {
  id: string,
  textbookKey: string,
  catalogKey: string,
  questionType: string,
  tags?: string[],
  rateVal?: string,
  titleVal: string,
  mentionVal?: string,
  imageNames?: string[],
  showImageVal?: string,
  aVal?: string,
  bVal?: string,
  cVal?: string,
  dVal?: string,
  eVal?: string,
  showSelectVal?: string,
  answerVal?: string,
  knowledgeVal?: string,
  analyzeVal?: string,
  processVal?: string,
  remarkVal?: string,
}

export interface QuestionUploadReq {
  textbookKey: string,
  catalogKey: string,
  sourceId?: string,
  questionType: string,
  tags?: string[],
  rateVal?: string,
  titleVal: string,
  mentionVal?: string,
  imageNames?: string[],
  showImageVal?: string,
  aVal?: string,
  bVal?: string,
  cVal?: string,
  dVal?: string,
  eVal?: string,
  showSelectVal?: string,
  answerVal?: string,
  knowledgeVal?: string,
  analyzeVal?: string,
  processVal?: string,
  remarkVal?: string,
}

export interface QuestionUploadResp {
  id: string,
}
