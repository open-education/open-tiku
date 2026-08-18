import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";

function Teacher() {
  return (
    <section className="bg-primary">
      <div className="px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-primary-foreground text-xl font-medium mb-1" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            成为教师角色
          </p>
          <p className="text-primary-foreground/70 text-sm">上传自制题目，精选现有试卷，基于题库生成试卷，管理班级学情，一站式教学辅助工具</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="text-sm border border-primary-foreground/30 text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary-foreground/10 transition-colors">
            了解更多
          </button>

          <Dialog>
            <DialogTrigger
              render={
                <button className="text-sm bg-primary-foreground text-primary px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  加入教师角色
                </button>
              }
            />
            <DialogContent className="w-200! max-w-[90vw]!">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">申请加入教师角色</DialogTitle>
                <DialogDescription className="text-base">教师角色权限目前只能通过网站管理员手动添加</DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="no-scrollbar max-h-[50vh] px-4 overflow-y-auto space-y-4">
                <div className="flex items-center justify-center text-base font-semibold text-blue-700">终于等到你，还好我没放弃！</div>

                <div className="text-sm text-gray-700">欢迎申请成为「教师用户」—— 我们最珍视的伙伴</div>

                <div className="space-y-4 text-sm">
                  <p>亲爱的伙伴：你终于迈出了这一步——申请成为教师用户，我们真的无比欣喜！教师，是我们平台最高权限的角色，你将承担：</p>

                  <div className="space-y-2 pl-8 font-medium">
                    <p>审核题目与试卷：把控内容质量，为学习者筛选精华； </p>

                    <p>创建并管理班级：上传学生账户，开展个性化教学； </p>

                    <p>管理学情：跟踪学情，给予针对性指导。</p>
                  </div>

                  <p>
                    我们愿意把最大的自主权交给你，因为信任你的专业与热忱。但同时，我们也必须坦诚相告：权限越大，责任越重。你审核的每一道题、每一份试卷，都会影响成百上千的学习者。
                  </p>

                  <p>
                    我们深深担忧——若内容出现违法违规、低俗或不符当地法规的偏差，不仅会伤害学生，也会给平台带来难以承受的风险。然而，我们更清楚，没有你们，平台的题库会枯竭，审核会瘫痪，班级服务将形同虚设。我们的日常运营，迫切需要你的智慧与付出。
                  </p>
                </div>

                <div className="text-sm text-blue-700 font-semibold">我已阅读并理解教师用户权限与责任，愿意遵守平台内容规范。</div>

                <div className="text-sm">下面是发送申请的邮件模板：</div>

                <div className="text-sm">
                  <pre>邮件标题：[账号来源选择 GitHub | QQ]-[昵称]-申请教师用户权限, 例如：QQ-Sui-申请教师用户权限</pre>
                  <pre>邮件内容：我已阅读并理解教师用户权限与责任，愿意遵守平台内容规范。</pre>
                </div>

                <div className="text-sm">
                  将该邮件发送到管理员邮箱账户: <span className="text-blue-400">z@oef.org.cn</span>，收到邮件后我们会尽快做出判断并给你反馈。
                </div>
              </div>

              <Separator />

              <DialogFooter>
                <DialogClose render={<Button>Close</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}

export { Teacher };
