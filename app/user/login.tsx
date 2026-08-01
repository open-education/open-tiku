import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "~/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

export function Login() {
  const [isGithubRedirecting, setIsGithubRedirecting] = useState(false);
  const [isQQRedirecting, setIsQQRedirecting] = useState(false);

  const githubRedirectUrl = import.meta.env.VITE_GITHUB_CALLBACK_URL;
  const qqRedirectUrl = import.meta.env.VITE_QQ_CALLBACK_URL;

  const handleGithubLogin = () => {
    setIsGithubRedirecting(true);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=Iv23liIsMUEOMyDagK0H&redirect_uri=${encodeURIComponent(githubRedirectUrl)}`;
  };

  const handleQQLogin = () => {
    setIsQQRedirecting(true);
    window.location.href = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=xxx&redirect_uri=${encodeURIComponent(qqRedirectUrl)}&state=tiku&scope=get_user_info`;
  };

  return (
    <div className="flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardDescription className="text-sm">学生角色账户若忘记密码，需联系你的老师给你找回或者重置密码；其它角色只接受第三方登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name" className="text-sm">
                  昵称
                </FieldLabel>
                <Input id="name" className="text-sm md:text-sm" type="string" placeholder="uu" required />
                <FieldDescription className="text-sm">由你的老师帮你创建的账号</FieldDescription>
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-sm">
                    密码
                  </FieldLabel>
                </div>
                <Input id="password" className="text-sm md:text-sm" type="password" required placeholder="******" />
              </Field>

              <Field>
                <Button variant="default">登录</Button>
              </Field>

              <FieldSeparator className="text-sm">Or continue with</FieldSeparator>

              <Field>
                <Button variant="outline" className="w-full text-sm justify-start gap-1" onClick={handleGithubLogin} disabled={isGithubRedirecting}>
                  {isGithubRedirecting ? (
                    "登录中..."
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                      用 GitHub 账户登录
                    </>
                  )}
                </Button>
              </Field>

              <Field>
                <Button variant="outline" className="w-full text-sm justify-start gap-1" onClick={handleQQLogin} disabled={isQQRedirecting}>
                  {isQQRedirecting ? (
                    "登录中..."
                  ) : (
                    <>
                      <img src="qq-login.png" />用 QQ 账户登录
                    </>
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
