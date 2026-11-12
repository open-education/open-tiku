import type { UserInfoResp } from '@/type/user';
import { useEffect, useState } from 'react';

// 获取用户信息
export const useUserInfo = () => {
  const [user, setUser] = useState<UserInfoResp | null>(null);

  const updateUser = () => {
    try {
      const raw = localStorage.getItem('user');
      setUser(raw ? JSON.parse(raw) : null);
    } catch (err) {
      console.log('获取用户信息出错: ', err);
      setUser(null);
    } finally {
    }
  };

  useEffect(() => {
    updateUser();
    window.addEventListener('storage', updateUser);
    window.addEventListener('user-update', updateUser);
    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('user-update', updateUser);
    };
  }, []);

  return user;
};
