// 添加作业请求
export interface HomeworkAddReq {
  batchNo: number;
  paperId: number;
  title: string;
  remark: string;
  classMap: Record<number, number[]>;
}
