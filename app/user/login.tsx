import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "~/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

// 登录
export function Login() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardDescription>学生角色账户若忘记密码, 需联系你的老师给你找回或者重置密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">昵称</FieldLabel>
                <Input id="name" type="string" placeholder="uu" required />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">密码</FieldLabel>
                </div>
                <Input id="password" type="password" required placeholder="******" />
              </Field>
              <Field>
                <Button type="submit">登录</Button>
                <Button variant="outline" type="button">
                  Login with GitHub
                </Button>
                <FieldDescription className="text-center">支持 QQ 扫码, GitHub 账号登录</FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
