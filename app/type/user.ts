// 用户临时换取登录token
export interface ExchangeTokenReq {
  tempToken: string;
}

// 用户登录请求
export interface UserLoginReq {
  token: string;
}

// 用户信息
export interface UserInfoResp {
  userId: number;
  username: string;
  email: string;
  role: number;
  status: number;
}
