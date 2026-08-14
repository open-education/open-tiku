// 班级信息编辑请求
export interface ClassInfoReq {
  id?: number;
  year: string;
  grade?: string;
  semester?: string;
  label: string;
  sortOrder: number;
  remark: string;
}

// 班级搜索
export interface ClassSearchReq {
  year: string;
  grade: string;
  semester: string;
}

// 班级列表请求
export interface ClassListReq {
  year?: string;
  grade?: string;
  semester?: string;
  pageNo: number;
  pageSize: number;
}

// 编辑信息返回
export interface ClassInfoResp {
  id: number;
  year: string;
  grade: string;
  semester: string;
  label: string;
  sortOrder: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// 班级列表返回
export interface ClassListResp {
  list: ClassInfoResp[];
  pageNo: number;
  pageSize: number;
  total: number;
}
