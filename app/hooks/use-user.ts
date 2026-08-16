import { useEffect, useState } from "react";
import type { UserInfoResp } from "~/type/user";

// 保存用户登录信息
export const useSaveAuth = (token: string, userInfo: UserInfoResp) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(userInfo));
  window.history.replaceState(null, "", window.location.pathname);
  window.dispatchEvent(new Event("user-update"));
};

// 清除用户登录认证信息
export const useClearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("user-update"));
};

// 获取用户信息
export const useUserInfo = (): UserInfoResp | null => {
  const [user, setUser] = useState<UserInfoResp | null>(null);

  const updateUser = () => {
    const raw = localStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : null);
  };

  useEffect(() => {
    updateUser();
    window.addEventListener("storage", updateUser);
    window.addEventListener("user-update", updateUser);
    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("user-update", updateUser);
    };
  }, []);

  return user;
};
