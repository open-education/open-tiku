import { Separator } from "~/components/ui/separator";
import type { Route } from "./+types/faqs";

// FAQs

export function meta({}: Route.MetaArgs) {
  return [
    { title: "帮助中心-FAQs" },
    {
      name: "description",
      content: "收集整理网站常见的疑问和做一些适当的说明",
    },
  ];
}

export default function Index() {
  return (
    <section className="p-4">
      <div className="w-full p-8 bg-white">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">常见问题</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base">常见问题问答整理</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold">1. 账户和登录</h3>

          <Separator />

          <p className="text-muted-foreground leading-relaxed text-sm">
            目前不考虑用户账户自主注册，因此接入了 GitHub 和 QQ
            两种支持个人用户接入的第三方渠道账户登录，我们也不收集除昵称外的包括头像，邮箱等任何信息。学生账户需要教师建立班级后手动导入账户，成功后会以邮件的形式将用户名和登录密码发送至你的个人邮箱，由教师自己将账号分发到具体的学生手中。
          </p>

          <p className="text-muted-foreground leading-relaxed text-sm">
            对于当前使用比较多的
            微信、支付宝、快手和抖音等社交平台账号，因为我们还没有企业资质，暂时无法申请接入到系统中，等以后我们申请到了企业资质后，我们会第一时间支持这些平台的账户登录。
          </p>
        </div>
      </div>
    </section>
  );
}
