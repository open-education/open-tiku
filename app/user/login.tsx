import React, { useState } from "react";
import { useNavigate } from "react-router";
import { SimpleAlert } from "~/common/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "~/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useClearAuth, useSaveAuth } from "~/hooks/use-user";
import { UserLoginSource } from "~/type/enum";
import type { StudentLoginReq, UserInfoResp, UserLoginReq } from "~/type/user";
import { httpClient } from "~/util/http";
import { StringValidator } from "~/util/string";

// 账户登录

const defaultStudentLoginReq: StudentLoginReq = {
  account: "",
  password: "",
};

// 当前自己浏览器登录只保留最新的一个有效用户
export function Login() {
  const navigate = useNavigate();

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>(null);

  // 学生账户登录, 用户名密码登录
  const [studentLoggingIn, setStudentLoggingIn] = useState<boolean>(false);

  const [logInReq, setLogInReq] = useState<StudentLoginReq>(defaultStudentLoginReq);
  const updateLogInReq = (key: keyof StudentLoginReq, value: string) => {
    setLogInReq((prev) => ({ ...prev, [key]: value }));
  };

  // 学生登录
  const handleStudentLogin = () => {
    setWarnInfo("");

    if (!StringValidator.isNonEmpty(logInReq.account)) {
      setWarnInfo(<SimpleAlert title="登录参数校验" message="账户为空" />);
      return;
    }
    if (!StringValidator.isNonEmpty(logInReq.password)) {
      setWarnInfo(<SimpleAlert title="登录参数校验" message="密码为空" />);
      return;
    }

    // 账户登录
    setStudentLoggingIn(true);

    let req: UserLoginReq = {
      source: UserLoginSource.Student,
      account: logInReq.account,
      password: logInReq.password,
    };

    httpClient
      .post<UserInfoResp>("/user/login", req)
      .then((userInfo) => {
        // 检查 token 信息
        if (!StringValidator.isNonEmpty(userInfo.token)) {
          setWarnInfo(<SimpleAlert title="登录失败" message="账户信息不完整" />);
          return;
        }
        useSaveAuth(userInfo.token, userInfo);
        navigate("/", { replace: true }); // 登录成功跳转
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="登录失败" message={err.message} />);
        useClearAuth();
      })
      .finally(() => {
        setStudentLoggingIn(false);
      });
  };

  // 第三方账户登录
  const [isGithubRedirecting, setIsGithubRedirecting] = useState(false);
  const [isQQRedirecting, setIsQQRedirecting] = useState(false);

  const handleNormalLogin = (providerType: number) => {
    setWarnInfo("");

    if (providerType == 1) {
      setIsGithubRedirecting(true);
    } else {
      setIsQQRedirecting(true);
    }

    // 换取登录url
    httpClient
      .get<string>(`/callback/${providerType}/login/url`)
      .then((res) => {
        if (!res || res.length == 0) {
          setWarnInfo(<SimpleAlert title="登录异常" message="无法获取到有效的第三方登录链接" />);
          return;
        }

        window.location.href = res;
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="登录异常" message={err.message} />);
      });
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
                <Input
                  id="name"
                  className="text-sm md:text-sm"
                  type="string"
                  placeholder="uu"
                  required
                  value={logInReq.account}
                  onChange={(e) => updateLogInReq("account", e.target.value)}
                />
                <FieldDescription className="text-sm">由你的老师帮你创建的账号</FieldDescription>
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-sm">
                    密码
                  </FieldLabel>
                </div>
                <Input
                  id="password"
                  className="text-sm md:text-sm"
                  type="password"
                  required
                  placeholder="******"
                  value={logInReq.password}
                  onChange={(e) => updateLogInReq("password", e.target.value)}
                />
              </Field>

              <Field>
                <Button variant="default" onClick={handleStudentLogin} disabled={studentLoggingIn}>
                  {studentLoggingIn ? "登录中..." : "登录"}
                </Button>
              </Field>

              <FieldSeparator className="text-sm">Or continue with</FieldSeparator>

              <Field>
                <Button
                  variant="outline"
                  className="w-full text-sm justify-start gap-1"
                  onClick={() => handleNormalLogin(1)}
                  disabled={isGithubRedirecting}
                >
                  {isGithubRedirecting ? (
                    "登录中..."
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                      用 GitHub 账户登录
                    </>
                  )}
                </Button>
              </Field>

              <Field>
                <Button
                  variant="outline"
                  className="w-full text-sm justify-start gap-1"
                  onClick={() => handleNormalLogin(2)}
                  disabled={isQQRedirecting}
                >
                  {isQQRedirecting ? (
                    "登录中..."
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                        <path
                          d="M511.037 986.94c-85.502 0-163.986-26.686-214.517-66.544-25.66 7.149-58.486 18.655-79.202 32.921-17.725 12.202-15.516 24.647-12.32 29.67 14.027 22.069 240.622 14.092 306.04 7.219v-3.265z"
                          fill="#FAAD08"
                          p-id="6992"
                        ></path>
                        <path
                          d="M495.627 986.94c85.501 0 163.986-26.686 214.518-66.544 25.66 7.149 58.485 18.655 79.203 32.921 17.724 12.202 15.512 24.647 12.32 29.67-14.027 22.069-240.623 14.092-306.042 7.219v-3.265z"
                          fill="#FAAD08"
                          p-id="6993"
                        ></path>
                        <path
                          d="M496.137 472.026c140.73-0.935 253.514-27.502 291.73-37.696 9.11-2.432 13.984-6.789 13.984-6.789 0.032-1.25 0.578-22.348 0.578-33.232 0-183.287-88.695-367.458-306.812-367.47C277.5 26.851 188.8 211.021 188.8 394.31c0 10.884 0.55 31.982 0.583 33.232 0 0 3.965 4.076 11.231 6.048 35.283 9.579 150.19 37.482 294.485 38.437h1.037zM883.501 626.967c-8.66-27.825-20.484-60.273-32.455-91.434 0 0-6.886-0.848-10.366 0.158-107.424 31.152-237.624 51.006-336.845 49.808h-1.026c-98.664 1.186-227.982-18.44-335.044-49.288-4.09-1.176-12.168-0.677-12.168-0.677-11.97 31.16-23.793 63.608-32.453 91.433-41.3 132.679-27.92 187.587-17.731 188.818 21.862 2.638 85.099-99.88 85.099-99.88 0 104.17 94.212 264.125 309.947 265.596a765.877 765.877 0 0 1 5.725 0c215.738-1.471 309.947-161.424 309.947-265.595 0 0 63.236 102.519 85.102 99.88 10.186-1.231 23.566-56.14-17.732-188.819"
                          p-id="6994"
                        ></path>
                        <path
                          d="M429.208 303.911c-29.76 1.323-55.195-32.113-56.79-74.62-1.618-42.535 21.183-78.087 50.95-79.417 29.732-1.305 55.149 32.116 56.765 74.64 1.629 42.535-21.177 78.08-50.925 79.397m220.448-74.62c-1.593 42.507-27.03 75.941-56.79 74.62-29.746-1.32-52.553-36.862-50.924-79.397 1.614-42.526 27.03-75.948 56.764-74.639 29.77 1.33 52.57 36.881 50.951 79.417"
                          fill="#FFFFFF"
                          p-id="6995"
                        ></path>
                        <path
                          d="M695.405 359.069c-7.81-18.783-86.466-39.709-183.843-39.709h-1.045c-97.376 0-176.033 20.926-183.842 39.709a6.66 6.66 0 0 0-0.57 2.672c0 1.353 0.418 2.575 1.072 3.612 6.58 10.416 93.924 61.885 183.341 61.885h1.045c89.416 0 176.758-51.466 183.34-61.883a6.775 6.775 0 0 0 1.069-3.622 6.66 6.66 0 0 0-0.567-2.664"
                          fill="#FAAD08"
                          p-id="6996"
                        ></path>
                        <path
                          d="M464.674 239.335c1.344 16.946-7.87 32-20.55 33.645-12.701 1.647-24.074-10.755-25.426-27.71-1.326-16.954 7.873-32.008 20.534-33.64 12.722-1.652 24.114 10.76 25.442 27.705m77.97 8.464c2.702-4.392 21.149-27.488 59.328-19.078 10.028 2.208 14.667 5.457 15.646 6.737 1.445 1.888 1.84 4.576 0.375 8.196-2.903 7.174-8.894 6.979-12.217 5.575-2.144-0.907-28.736-16.948-53.232 6.99-1.685 1.648-4.7 2.212-7.558 0.258-2.856-1.956-4.038-5.923-2.342-8.678"
                          p-id="6997"
                        ></path>
                        <path
                          d="M503.821 589.328h-1.031c-67.806 0.802-150.022-8.004-229.638-23.381-6.817 38.68-10.934 87.294-7.399 145.275 8.928 146.543 97.728 238.652 234.793 239.996h5.57c137.065-1.344 225.865-93.453 234.796-239.996 3.535-57.986-0.584-106.6-7.403-145.283-79.631 15.385-161.861 24.196-229.688 23.389"
                          fill="#FFFFFF"
                          p-id="6998"
                        ></path>
                        <path
                          d="M310.693 581.35v146.633s69.287 13.552 138.7 4.17V596.897c-43.974-2.413-91.4-7.79-138.7-15.546"
                          fill="#EB1C26"
                          p-id="6999"
                        ></path>
                        <path
                          d="M806.504 427.238s-130.112 43.08-302.66 44.309h-1.025c-172.264-1.224-302.217-44.161-302.66-44.309L156.58 541.321c108.998 34.464 244.093 56.677 346.238 55.387l1.024-0.002c102.152 1.297 237.226-20.917 346.24-55.385l-43.579-114.083z"
                          fill="#EB1C26"
                          p-id="7000"
                        ></path>
                      </svg>
                      用 QQ 账户登录
                    </>
                  )}
                </Button>
              </Field>
            </FieldGroup>

            {warnInfo}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
