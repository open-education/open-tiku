// 任务上传请求
export interface TaskSaveReq {
  questionCateId: number;
  taskType: number; // 任务类型 1 题目上传
  name: string;
  url: string;
  email: string;
  textbookId: number; // 目前在第2层上, 跟题型标签一个维度
}

// 任务列表请求
export interface TaskListReq {
  questionCateId: number;
  taskType: number;
  pageNo: number;
  pageSize: number;
}

// 任务详情
export interface TaskInfo {
  id: number;
  questionCateId: number;
  taskType: number;
  name: string;
  author: string;
  email: string;
  status: number;
  statusDesc: string;
  result?: string;
  createdAt: string;
  updatedAt: string;
}

// 任务列表返回
export interface TaskListResp {
  list: TaskInfo[];
  pageNo: number;
  pageSize: number;
  total: number;
}
