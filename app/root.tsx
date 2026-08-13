import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import "~/app.css";
import React from "react";
import { Toaster } from "~/components/ui/sonner";
import { InitLoading } from "~/common/load";
import { Error } from "~/common/error";
import { ObjectUtil } from "~/util/object";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}

        {/* toast 提示位置顶部居中 */}
        <Toaster position="top-center" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// SPA 模式只能在根路由添加加载中的提示
export function HydrateFallback() {
  return <InitLoading />;
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "发生了意外错误";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "找不到请求的页面" : error.statusText || details;
  } else if (import.meta.env.DEV && ObjectUtil.isError(error)) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <Error message={message} details={details} stack={stack} />
    </main>
  );
}
