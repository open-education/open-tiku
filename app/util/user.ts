import { useUserInfo } from '@/hooks/use-user';
import { UserLoginSource } from '@/type/enum';
import type { UserInfoResp } from '@/type/user';
import { httpClient } from '@/util/http';
import type { NavigateFunction } from 'react-router';
import { toast } from 'sonner';

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

// 用户换取 roken 登录
export const finalUserLogin = (navigate: NavigateFunction) => {
  const params = new URLSearchParams(window.location.search);
  const tempToken = params.get('token');

  if (tempToken) {
    // 临时换票流程
    httpClient
      .post<string>('/user/exchange', { tempToken })
      .then((realToken) =>
        httpClient
          .post<UserInfoResp>('/user/login', { source: UserLoginSource.User, token: realToken })
          .then((userInfo) => ({ realToken, userInfo })),
      )
      .then(({ realToken, userInfo }) => {
        saveAuth(realToken, userInfo);
        navigate('/', { replace: true }); // 登录成功跳转
      })
      .catch((err) => {
        toast.error(err.message);
        clearAuth();
      });
  } else {
    // 静默登录：检查本地 token 是否有效, 所以同一时刻只能登录一个账户, 后续看是否支持多账户登录, 因为 token 虽然生效但是被强制替换了
    const token = localStorage.getItem('token');
    if (token) {
      httpClient
        .get<UserInfoResp>(`/user/info/${token}`)
        .then((userInfo) => {
          localStorage.setItem('user', JSON.stringify(userInfo));
          window.dispatchEvent(new Event('user-update'));
        })
        .catch(() => {
          clearAuth(); // token 失效，清除
        });
    } else {
      clearAuth(); // 无 token，确保 user 为空
    }
  }
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
