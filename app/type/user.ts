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
