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
    <section className="px-4 py-4 sm:px-16 sm:py-4 mx-auto">
      <div className="w-full p-8 bg-white">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">常见问题</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base">常见问题整理和注意事项补充说明</p>
        </div>

        {/* 账户和登录 */}
        <div className="space-y-3 mt-4">
          <h3 className="text-base font-semibold">1. 账户和登录</h3>

          <Separator />

          <div className="text-muted-foreground leading-relaxed text-sm space-y-2">
            <p>
              目前不考虑用户账户自主注册，因此接入了 GitHub 和 QQ
              两种支持个人开发者接入的第三方渠道账户，我们也不收集除昵称外的包括头像，邮箱等任何信息
            </p>

            <p>学生账户需要教师建立班级后手动导入，成功后会以邮件的形式将用户名和登录密码发送至你的个人邮箱中，由你自己将账号分发到具体的学生手里</p>

            <p>
              对于当前使用较多的微信、支付宝、快手和抖音等社交平台账号，我们还没有企业资质，暂时无法申请接入到系统中，等我们申请到企业资质后，会第一时间支持这些平台的账户登录
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
              ，请仔细甄别；如果收到其它邮箱给你发的信息或者链接，请不要轻易信任并点击，避免上当受骗，造成个人信息泄露甚至经济损失
            </p>

            <p>该邮箱服务的发送频率和数量限制如下：每月 15000 封邮件，每天 500 封邮件，每2秒 1封邮件；如果频繁发送可能无法接收对应的邮件</p>
          </div>
        </div>

        {/* 教师角色 */}
        <div className="space-y-3 mt-4">
          <h3 className="text-base font-semibold">3. 教师角色</h3>

          <Separator />

          <div className="text-muted-foreground leading-relaxed text-sm space-y-2">
            <p>需要在首页申请加入教师角色，发送申请邮件给网站管理员，等管理员确认将你升级为教师账户后生效</p>

            <p>
              网站没有配置超管一类的高权限账户，就目前来说，第三方登录账户角色升级为 <b>教师用户</b>
              后权限已经是最大；承担着审核题目和试卷的任务；还可以建立自己的班级，管理班级的学生
            </p>

            <p>题目和试卷的创建只要是登录用户均可上传</p>
          </div>
        </div>
      </div>
    </section>
  );
}
