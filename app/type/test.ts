import type { CommonPaperResp } from '~/type/paper';

// 学生作业列表请求
export interface TestListReq {
  startDate: string;
  endDate: string;
  pageNo: number;
  pageSize: number;
}

export interface TestInfoResp {
  id: number;
  homeworkId: number;
  studentId: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  paperInfo: CommonPaperResp;
}

export interface TestListResp {
  list: TestInfoResp[];
  pageNo: number;
  pageSize: number;
  total: number;
}

// 进行中的最新做题记录
export interface InProgressLatestAttemptReq {
  id: number;
  method: number;
}

// 做题记录详情
export interface AnswerInfoResp {
  id: number;
  // 做题记录标识
  attemptId: number;
  questionId: number;
  // 用户的最终选择/填写内容
  answer: string;
  // 是否正确 0 未作答 1 正确 2 错误
  result: number;
  resultDesc: string;
  // 笔记
  note: string;
  // 备注
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptInfoResp {
  id: number;
  studentId: number;
  homeworkId: number;
  classId: number;
  paperId: number;
  // 刷题轮次/批次 第1次刷 第2次刷...
  attemptNumber: number;
  // 训练方法 1 练习模式 2 考试模式
  method: number;
  methodDesc: string;
  // 状态：1 进行中 2 已交卷
  status: number;
  statusDesc: string;
  // 最终总得分 交卷前为0
  score: number;
  // 开始时间
  createdAt: string;
  // 进度更新时间, 减去开始时间为耗时
  updatedAt: string;
  // 交卷时间
  completedAt: string;

  answers: AnswerInfoResp[];
}

// 添加答案
export interface AnswerAddReq {
  questionId: number;
  // 用户的最终选择/填写内容
  answer: string;
  // 是否正确 0 未作答 1 正确 2 错误
  result: number;
  // 笔记
  note: string;
}

export interface TestAnswerAddReq {
  attemptId: number;
  status: number;
  list: AnswerAddReq[];
}

// 做题记录列表
export interface AttemptListReq {
  id: number;
  pageNo: number;
  pageSize: number;
}

export interface AttemptListResp {
  list: AttemptInfoResp[];
  pageNo: number;
  pageSize: number;
  total: number;
}
