import Footer from '@/components/home/footer';
import Header from '@/components/home/header';
import { UserLoginSource } from '@/type/enum';
import type { UserInfoResp } from '@/type/user';
import { httpClient } from '@/util/http';
import { clearAuth, saveAuth } from '@/util/user';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { Route } from './+types/main';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '开放题库 · 公益共建' },
    {
      name: 'description',
      content:
        '协同共创 · 智能开放教育生态，优质题库协同共创，AI 助力精准教学，让每个学生获得适配自身的个性化学习路径，依托母子题分层资源，打造「教-学-练-评-补」全闭环智能开放教育生态。',
    },
  ];
}

// 网站首页布局
export default function Main() {
  // 用户登录临时 token 换票
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  return (
    <div className="text-foreground bg-background min-h-screen flex flex-col">
      {/* 网站首页头部 */}
      <Header />

      {/* 替换网站内容 */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* 网站脚部 */}
      <Footer />
    </div>
  );
}
