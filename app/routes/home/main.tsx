import type { Route } from "./+types/main";
import { Header } from "~/home/header";
import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { httpClient } from "~/util/http";
import type { UserInfoResp } from "~/type/user";
import { toast } from "sonner";
import { Footer } from "~/home/footer";
import { UserLoginSource } from "~/type/enum";
import { useClearAuth, useSaveAuth } from "~/hooks/use-user";

/// 网站首页顶部和底部框架
export function meta({}: Route.MetaArgs) {
  return [
    { title: "开放题库-以素养为导向的精准教学平台" },
    {
      name: "description",
      content:
        "根据中小学教材章节和教育部发布的考点进行选题，精选历年高考中考和名校期末月考等试卷，手动根据需要和学情自主组卷，辅助教学视频等提供以素养为导向的精准教学、练题平台。",
    },
  ];
}

// 首页样式后续根据需要调整, 需要将所有请求封装进入组件挂载时请求
// 其它页面后续替换只保留静态的头和底
export default function Main() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tempToken = params.get("token");

    if (tempToken) {
      // 临时换票流程
      httpClient
        .post<string>("/user/exchange", { tempToken })
        .then((realToken) =>
          httpClient
            .post<UserInfoResp>("/user/login", { source: UserLoginSource.User, token: realToken })
            .then((userInfo) => ({ realToken, userInfo })),
        )
        .then(({ realToken, userInfo }) => {
          useSaveAuth(realToken, userInfo);
          navigate("/", { replace: true }); // 登录成功跳转
        })
        .catch((err) => {
          toast.error(err.message);
          useClearAuth();
        });
    } else {
      // 静默登录：检查本地 token 是否有效, 所以同一时刻只能登录一个账户, 后续看是否支持多账户登录, 因为 token 虽然生效但是被强制替换了
      const token = localStorage.getItem("token");
      if (token) {
        httpClient
          .get<UserInfoResp>(`/user/info/${token}`)
          .then((userInfo) => {
            localStorage.setItem("user", JSON.stringify(userInfo));
            window.dispatchEvent(new Event("user-update"));
          })
          .catch(() => {
            useClearAuth(); // token 失效，清除
          });
      } else {
        useClearAuth(); // 无 token，确保 user 为空
      }
    }
  }, []);

  return (
    <div className="text-foreground bg-gray-100 min-h-screen flex flex-col">
      {/* 网站首页头部 */}
      <Header />

      {/* 替换网站内容 */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* 网站底部 */}
      <Footer />
    </div>
  );
}
