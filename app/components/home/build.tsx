import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const partnerSchools = ['北海市第一中学', '南宁市第三中学', '长沙市雅礼中学', '深圳实验学校', '广州市第二中学', '成都七中育才'];

export default function Build() {
  return (
    <div className="bg-linear-to-b from-blue-50 to-white py-20">
      <div className="mx-auto max-w-300 px-10">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-[28px] font-bold text-gray-900">共建共享，让优质教育资源流动起来</h2>
          <p className="mx-auto max-w-140 text-sm text-gray-500">已有 32 所学校、156 位教师加入共建，贡献 2,847 道优质题目</p>
        </div>

        {/* 合作学校 */}
        <div className="mb-10">
          <div className="mb-4 text-sm font-semibold text-gray-700">🏫 合作学校</div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">
            {partnerSchools.map((s, i) => (
              <div key={i} className="border border-gray-200 bg-white px-2.5 py-3.5 text-center text-xs font-medium text-gray-700">
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* 贡献激励 */}
        <div className="flex items-center justify-between bg-linear-to-br px-12 py-10 bg-muted">
          <div>
            <div className="mb-2 text-xl font-bold">加入共建计划</div>
            <div className="text-sm leading-[1.8] opacity-90">上传题目获得下载/组卷次数 · 优秀贡献者可获骨干徽章与专家资格</div>
          </div>

          <Dialog>
            <DialogTrigger
              render={<Button className="text-sm shrink-0 border-0 bg-white px-8 py-3 font-semibold text-blue-900">加入教师角色</Button>}
            />
            <DialogContent className="w-200! max-w-[90vw]!">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">申请加入教师角色</DialogTitle>
                <DialogDescription>教师角色权限目前只能通过网站管理员手动添加</DialogDescription>
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
                  <div>
                    <span className="font-semibold">邮件标题：</span>[账号来源选择 GitHub | QQ]-[昵称]-申请教师用户权限, 例如：
                    <span className="font-semibold">QQ-Sui-申请教师用户权限</span>
                  </div>
                  <div>
                    <span className="font-semibold">邮件内容：</span>我已阅读并理解教师用户权限与责任，愿意遵守平台内容规范。
                  </div>
                </div>

                <div className="text-sm">
                  将该邮件发送给管理员邮箱账户: <span className="text-blue-400">z@oef.org.cn</span>，收到邮件后我们会尽快做出判断并给你反馈。
                </div>
              </div>

              <Separator />

              <DialogFooter>
                <DialogClose render={<Button>关闭</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
