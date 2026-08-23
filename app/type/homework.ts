import type { ClassStudentResp } from "./class";

// 添加作业请求
export interface HomeworkAddReq {
  batchNo: number;
  paperId: number;
  title: string;
  remark: string;
  classMap: Record<number, number[]>;
}

// 作业布置列表请求
export interface HomeworkListSearchReq {
  paperId: number;
  batchNo?: number;
}

// 作业布置列表请求
export interface HomeworkListReq {
  paperId: number;
  batchNo?: number;
  pageNo: number;
  pageSize: number;
}

// 作业列表详情返回
export interface HomeworkInfoResp {
  id: number;
  batchNo: number;
  homeworkId: number;
  paperId: number;
  classId: number;
  authorId: number;
  title: string;
  remark: string;
  students: ClassStudentResp[];
  createdAt: string;
}

export interface HomeworkListResp {
  list: HomeworkInfoResp[];
  pageNo: number;
  pageSize: number;
  total: number;
}
