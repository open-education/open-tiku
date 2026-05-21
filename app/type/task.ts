// 任务上传请求
export interface TaskSaveReq {
  questionCateId: number;
  taskType: number;
  name: string;
  url: string;
  email: string;
}
