import { BookOpen, ChartArea, GraduationCap, Users } from 'lucide-react';

const missionItems = [
  { icon: GraduationCap, title: '为教师减负提效', desc: '一站式出题/组卷/批改/学情工具，让教师从重复劳动中解放。' },
  { icon: Users, title: '为学生精准赋能', desc: '学情数据定位薄弱点，个性化推送练习，针对性提升。' },
  { icon: BookOpen, title: '为教育资源增值', desc: '共建共享动态生长的区域数字化资源库，优质资源流动。' },
  { icon: ChartArea, title: '为管理提供支撑', desc: '数据驱动的教学决策依据，助力教学改革与质量提升。' },
];

export default function Mission() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-300 px-4 sm:px-6 lg:px-10">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-[28px] font-bold text-gray-900">平台价值</h2>
          <p className="text-sm text-gray-500">开放协作汇聚教育智慧，人工智能赋能因材施教</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {missionItems.map((m, i) => {
            const IconComp = m.icon;
            return (
              <div key={i} className="bg-white px-6 py-7 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-linear-to-br from-blue-50 to-blue-100 text-blue-500">
                  <IconComp className="size-6.5" />
                </div>
                <div className="mb-2.5 text-base font-semibold text-gray-900">{m.title}</div>
                <div className="text-[13px] leading-[1.8] text-gray-500">{m.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
