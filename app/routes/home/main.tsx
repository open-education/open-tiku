import type { Route } from "./+types/main";
import { Footer } from "~/home/footer";
import { Header } from "~/home/header";
import { Outlet } from "react-router";
import { useEffect, useState } from "react";
import { httpClient } from "~/util/http";
import type { ExchangeTokenReq, UserInfoResp, UserLoginReq } from "~/type/user";
import { toast } from "sonner";
import "katex/dist/katex.min.css";

/// 网站首页顶部和底部框架
export function meta({}: Route.MetaArgs) {
  return [
    { title: "开放题库" },
    {
      name: "description",
      content: "根据中小学教材章节和教育部发布的考点进行选题，精选历年高考中考和名校期末月考等试卷，辅助教学视频等给学生提供精选的题库进行练习。",
    },
  ];
}

// 首页样式后续根据需要调整, 需要将所有请求封装进入组件挂载时请求
// 其它页面后续替换只保留静态的头和底
export default function Main() {
  const [currentUser, setCurrentUser] = useState<UserInfoResp | null>(null);

  useEffect(() => {
    // 1. 检测 URL 中是否有 Hash 参数, 此时是换取登录 token
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // 去掉 #
    const tempToken = params.get("temp_token");
    if (tempToken) {
      const tempReq: ExchangeTokenReq = {
        tempToken,
      };

      // 换取登录 token
      httpClient
        .post<string>("/user/exchange", tempReq)
        .then((tempRes) => {
          // 实际登录
          const loginReq: UserLoginReq = {
            token: tempRes,
          };
          httpClient
            .post<UserInfoResp>("/user/login", loginReq)
            .then((res) => {
              // 登录成功 记录 token 到 localStorage
              localStorage.setItem("token", tempRes);
              // 清除 URL 中的 Hash（防止刷新页面重复使用令牌）
              window.history.replaceState(null, "", window.location.pathname);
              setCurrentUser(res);
            })
            .catch((loginErr) => {
              toast.error(<div className="text-red-700">{loginErr.message}</div>);
              localStorage.removeItem("token");
            });
        })
        .catch((err) => {
          toast.error(<div className="text-red-700">{err.message}</div>);
        });
    } else {
      // 如果本地有存储 token 尝试请求看是否还在生效中
      const loginToken = localStorage.getItem("token");
      console.log("loginToken: ", loginToken);
      if (loginToken) {
        httpClient
          .get(`/user/info/${loginToken}`)
          .then((res) => {
            setCurrentUser(res);
          })
          .catch((err) => {
            toast.error(<div className="text-red-700">{err.message}</div>);
            localStorage.removeItem("token");
          });
      }
    }
  }, []);

  return (
    <div className="text-foreground bg-gray-100 min-h-screen flex flex-col">
      {/* 网站首页头部 */}
      <Header currentUser={currentUser} />

      {/* 替换网站内容 */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
