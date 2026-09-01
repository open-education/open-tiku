import type { CommonPaperResp } from "./paper";

// 学生作业列表请求
export interface TestListReq {
  startDate: string;
  endDate: string;
  pageNo: number;
  pageSize: number;
}

export interface TestInfoResp {
  id: number;
  deadline: string;
  paperInfo: CommonPaperResp;
}

export interface TestListResp {
  list: TestInfoResp[];
  pageNo: number;
  pageSize: number;
  total: number;
}
