// 任务上传请求
export interface TaskSaveReq {
  twoLevelId: number;
  fiveLevelId: number;
  questionCateId: number;
  taskType: number; // 任务类型 1 题目上传
  name: string;
  url: string;
  email: string;
}

// 任务列表请求
export interface TaskListReq {
  twoLevelId: number;
  fiveLevelId?: number;
  questionCateId?: number;
  taskType: number;
  pageNo: number;
  pageSize: number;
}

// 任务详情
export interface TaskInfo {
  id: number;
  twoLevelId: number;
  fiveLevelId: number;
  questionCateId: number;
  taskType: number;
  name: string;
  url: string;
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
