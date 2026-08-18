import { Separator } from "~/components/ui/separator";
import type { Route } from "./+types/faqs";
import { StringConst } from "~/util/string";

// FAQs
// 对关键的问题直接编写即可, 不再做其它的维护

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
          <p className="text-muted-foreground mx-auto max-w-2xl text-base">常见问题问答整理和注意事项补充说明</p>
        </div>

        {/* 账户和登录 */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">1. 账户和登录</h3>

          <Separator />

          <div className="text-muted-foreground leading-relaxed text-sm space-y-2">
            <p>
              目前不考虑用户账户自主注册，因此接入了 GitHub 和 QQ
              两种支持个人用户接入的第三方渠道账户登录，我们也不收集除昵称外的包括头像，邮箱等任何信息
            </p>

            <p>
              学生账户需要教师建立班级后手动导入账户，成功后会以邮件的形式将用户名和登录密码发送至你的个人邮箱，由教师自己将账号分发到具体的学生手中
            </p>

            <p>
              对于当前使用比较多的
              微信、支付宝、快手和抖音等社交平台账号，因为我们还没有企业资质，暂时无法申请接入到系统中，等以后我们申请到了企业资质后，我们会第一时间支持这些平台的账户登录
            </p>
          </div>
        </div>

        {/* 服务邮箱 */}
        <div className="space-y-3 mt-4">
          <h3 className="text-base font-semibold">2. 服务邮箱</h3>

          <Separator />

          <div className="text-muted-foreground leading-relaxed text-sm space-y-2">
            <p>
              给你发送学生账户和密码通知的服务邮箱抬头是：&nbsp;
              <span className="text-blue-600 text-base font-semibold">
                {StringConst.defaultServEmailTitle}
                &nbsp;&lt;{StringConst.defaultServEmail}&gt;
              </span>
              ，请仔细甄别；如果收到其它邮箱给你发的信息或者是链接，请不要轻易信任并点击，避免上当受骗，造成个人信息泄露甚至经济损失
            </p>

            <p>该邮箱服务的发送频率和数量限制如下：每月 15000 封邮件，每天 500 封邮件，每2秒 1封邮件；因此如果频繁发送可能无法接收对应的邮件</p>
          </div>
        </div>
      </div>
    </section>
  );
}
