import { useUserInfo } from '@/hooks/use-user';
import type { UserInfoResp } from '@/type/user';
import { httpClient } from '@/util/http';

// 保存用户登录信息
export const saveAuth = (token: string, userInfo: UserInfoResp) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userInfo));
  window.history.replaceState(null, '', window.location.pathname);
  window.dispatchEvent(new Event('user-update'));
};

// 清除用户登录认证信息
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('user-update'));
};

// 获取用户名称信息
export const getUserInfo = (): { isLogin: boolean; username: string } => {
  const user = useUserInfo();

  // 使用 Boolean() 确保 currentUser 为 null 时返回 false，而不是 null
  const isLogin = Boolean(user && user.userId > 0);
  const username = user?.email || user?.username || '';

  return { isLogin, username };
};

// 退出登录
export const handleLogout = () => {
  httpClient
    .get<boolean>('/user/logout')
    .then(() => {
      window.dispatchEvent(new Event('user-update'));
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    });
};
