import { useEffect, useState } from "react";
import type { UserInfoResp } from "~/type/user";

// 获取用户信息
export const useUser = (): UserInfoResp | null => {
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
