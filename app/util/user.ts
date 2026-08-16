import type { UserInfoResp } from "~/type/user";

// 保存用户登录信息
export const saveAuth = (token: string, userInfo: UserInfoResp) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(userInfo));
  window.history.replaceState(null, "", window.location.pathname);
  window.dispatchEvent(new Event("user-update"));
};

// 清除用户登录认证信息
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("user-update"));
};
