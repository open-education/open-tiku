import { Card } from '@/components/ui/card';
import { cn } from 'cn';
import { Book, Check, ChevronRight, Target, Wand, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

const colorMap = {
  blue: 'bg-blue-50 text-blue-500',
  purple: 'bg-violet-50 text-violet-500',
  green: 'bg-emerald-50 text-emerald-500',
  orange: 'bg-amber-50 text-amber-500',
} as const;

type FeatureColor = keyof typeof colorMap;

type Feature = {
  id: number;
  icon: LucideIcon;
  title: string;
  desc: string;
  color: FeatureColor;
  url: string;
};

const coreFeatures: Feature[] = [
  {
    id: 1,
    icon: Book,
    title: '题库中心·精准选题',
    desc: '按学段/科目/年级/考点五级目录精确定位，母子题分层体系。',
    color: 'blue',
    url: '/question',
  },
  {
    id: 2,
    icon: Wand,
    title: '智能组卷·一键成卷',
    desc: 'AI智能组卷+手动组卷+分层组卷，多种模式灵活选择。',
    color: 'purple',
    url: '',
  },
  {
    id: 3,
    icon: Check,
    title: '作业闭环·教学评补',
    desc: '布置→作答→批改→学情分析一站式闭环，解放教师时间。',
    color: 'green',
    url: '',
  },
  {
    id: 4,
    icon: Target,
    title: '精准学·个性路径',
    desc: '水平测试→诊断报告→个性化推送，因材施教精准提分。',
    color: 'orange',
    url: '',
  },
];

export default function Feature() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-300 px-10">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-[28px] font-bold text-gray-900">四大核心能力</h2>
          <p className="text-sm text-gray-500">覆盖精准教学全流程，助力教师高效教学、学生个性发展</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coreFeatures.map((item) => {
            const IconComp = item.icon;
            return (
              <Link key={item.id} to={item.url}>
                <Card
                  className={cn(
                    'group cursor-pointer gap-0 border-gray-100 bg-white px-6 py-7 shadow-none transition-all duration-200',
                    'hover:-translate-y-1 hover:border-blue-50 hover:shadow-[0_12px_32px_rgba(30,58,138,0.1)]',
                  )}
                >
                  <div className={cn('mb-4.5 flex size-14 items-center justify-center rounded-[14px]', colorMap[item.color])}>
                    <IconComp className="size-7" />
                  </div>
                  <div className="mb-2 text-base font-semibold text-gray-900">{item.title}</div>
                  <p className="mb-4 flex-1 text-[13px] leading-[1.7] text-gray-500">{item.desc}</p>
                  <div className="flex items-center gap-1 text-[13px] font-medium text-blue-500">
                    进入
                    <ChevronRight className="size-3.5" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
