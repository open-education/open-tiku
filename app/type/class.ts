// 班级信息编辑请求
export interface ClassInfoReq {
  id?: number;
  year: string;
  grade?: string;
  semester?: string;
  label: string;
  email: string;
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
  email: string;
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

// 学生信息部分
// 导入学生
export interface ClassStudentReq {
  classId: number;
  incremental: boolean;
  // 账户名称是英文逗号分割的字符串
  accounts: string;
}

// 解析学生账户输入结果
export interface StudentAccountParseResult {
  cleaned: string[]; // 清洗后的账户数组
  commaSeparated: string; // 逗号拼接的字符串
  duplicates: string[]; // 重复的账户列表（仅列出重复值）
}

// 班级学生账户列表
export interface ClassStudentResp {
  id: number;
  classId: number;
  userId: number;
  account: string;
  status: number; // 1 正常 2 暂停 3 停用
  statusDesc: string;
  remark: string;
  lastLoginTime: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
}

// 编辑学生账户信息
export interface ClassStudentEditReq {
  id: number;
  classId: number;
  account: string;
  resetPwd: boolean; // 是否重置密码
  status: number;
  remark: string;
}
