import type { Route } from "./+types/main";
import { Header } from "~/home/header";
import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { httpClient } from "~/util/http";
import type { UserInfoResp } from "~/type/user";
import { toast } from "sonner";
import "katex/dist/katex.min.css";
import { Footer } from "~/home/footer";

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

    const clearAuth = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("user-update"));
    };

    if (tempToken) {
      // 临时换票流程
      httpClient
        .post<string>("/user/exchange", { tempToken })
        .then((realToken) => httpClient.post<UserInfoResp>("/user/login", { token: realToken }).then((userInfo) => ({ realToken, userInfo })))
        .then(({ realToken, userInfo }) => {
          localStorage.setItem("token", realToken);
          localStorage.setItem("user", JSON.stringify(userInfo));
          window.history.replaceState(null, "", window.location.pathname);
          window.dispatchEvent(new Event("user-update"));
          navigate("/", { replace: true }); // 登录成功跳转
        })
        .catch((err) => {
          toast.error(err.message);
          clearAuth();
        });
    } else {
      // 静默登录：检查本地 token 是否有效
      const token = localStorage.getItem("token");
      if (token) {
        httpClient
          .get<UserInfoResp>(`/user/info/${token}`)
          .then((userInfo) => {
            localStorage.setItem("user", JSON.stringify(userInfo));
            window.dispatchEvent(new Event("user-update"));
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
