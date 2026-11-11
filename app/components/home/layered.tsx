import { Badge } from '@/components/ui/badge';
import { cn } from 'cn';

const badgeTags = ['题型标签', '核心素养', '知识点', '难度星级', '适用场景'];

const variantColorMap = {
  emerald: 'border-emerald-500 text-emerald-500',
  blue: 'border-blue-500 text-blue-500',
  amber: 'border-amber-500 text-amber-500',
  red: 'border-red-500 text-red-500',
} as const;

const variants = [
  { label: '基础变式', desc: '概念理解', color: 'emerald' },
  { label: '提升变式', desc: '思维进阶', color: 'blue' },
  { label: '应用变式', desc: '实际应用', color: 'amber' },
  { label: '拓展变式', desc: '创新挑战', color: 'red' },
] as const;

export default function Layered() {
  return (
    <section className="bg-[#f5f7fa] py-20">
      <div className="mx-auto max-w-300 px-10">
        <div className="grid grid-cols-1 items-center gap-15 lg:grid-cols-2">
          <div>
            <h2 className="mb-5 text-[28px] leading-[1.4] font-bold text-gray-900">
              以母子题为核心的
              <br />
              分层资源体系
            </h2>
            <p className="mb-6 text-sm leading-[1.9] text-gray-600">
              每一道母题对应四类变式题：基础变式 → 提升变式 → 应用变式 → 拓展变式。
              每道题配套五维标签（题型/核心素养/知识点/难度/适用场景）与完整解析， 满足不同层次学生的学习需求。
            </p>
            <div className="flex flex-wrap gap-3">
              {badgeTags.map((t) => (
                <Badge key={t} variant="outline" className="border-gray-200 bg-white p-3 text-xs font-normal text-gray-700 shadow-none">
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-50 bg-linear-to-br from-amber-400 to-amber-600 px-4.5 py-3.5 text-center text-white shadow-[0_4px_12px_rgba(217,119,6,0.3)]">
              <div className="mb-0.5 text-[15px] font-bold">母题</div>
              <div className="text-[11px] opacity-90">中考经典考法</div>
            </div>

            <div className="h-8 w-0.5 bg-cyan-300" />

            <div className="relative w-full">
              <div className="absolute inset-x-[12.5%] top-0 h-0.5 bg-cyan-300" />
              <div className="grid grid-cols-4">
                {variants.map((v) => (
                  <div key={v.label} className="flex justify-center">
                    <div className="h-6 w-0.5 bg-cyan-300" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid w-full grid-cols-4">
              {variants.map((v) => (
                <div key={v.label} className="px-1.5">
                  <div className={cn('border-2 bg-white px-2 py-2.5 text-center', variantColorMap[v.color])}>
                    <div className="text-[13px] font-semibold">{v.label}</div>
                    <div className="text-[10px] opacity-80">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 w-full border border-gray-200 bg-white px-5 py-4 text-xs leading-[1.8] text-gray-600">
              <div className="mb-1.5 font-semibold text-gray-800">五维结构化标签</div>
              题型 × 核心素养 × 知识点 × 难度星级 × 适用场景
              <br />
              每道题均含完整解析 · 思路介绍 · 易错点提示
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
