// 用户临时换取登录token
export interface ExchangeTokenReq {
  tempToken: string;
}

// 用户登录请求
export interface UserLoginReq {
  source: number; // 登录来源 1 普通第三方用户 2 学生
  token?: string;
  account?: string;
  password?: string;
}

// 用户信息
export interface UserInfoResp {
  userId: number;
  username: string;
  email: string;
  role: number;
  status: number;
  token?: string;
}

// 学生登录
export interface StudentLoginReq {
  account: string;
  password: string;
}

// 用户列表请求
export interface UserIdentityListReq {
  pageNo: number;
  pageSize: number;
}

// 第三方登录用户返回
export interface UserIdentityInfoResp {
  id: number;
  userId: number;
  provider: number;
  providerDesc: string;
  providerUsername: string;
  providerEmail: string;
  lastLoginTime: string;
  loginCount: number;
  role: number;
  roleDesc: string;
  status: number;
  statusDesc: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// 用户列表返回
export interface UserIdentityListResp {
  list: UserIdentityInfoResp[];
  pageNo: number;
  pageSize: number;
  total: number;
}

// Session 列表
export interface UserSessionListReq {
  pageNo: number;
  pageSize: number;
}

export interface UserSessionInfoResp {
  id: number;
  userId: number;
  sourceDesc: string;
  username: string;
  providerDesc: string;
  expiredAt: string;
  renewCnt: number;
  clientIp: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSessionListResp {
  list: UserSessionInfoResp[];
  pageNo: number;
  pageSize: number;
  total: number;
}

// 编辑请求
export interface UserIdentityInfoReq {
  id: number;
  status: number;
  remark: string;
}
