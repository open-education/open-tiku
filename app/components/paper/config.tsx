import { SearchList } from '@/components/question/nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { QuestionListReq } from '@/type/question';
import type { OtherDictListRecord } from '@/type/textbook';
import { cn } from 'cn';
import { useState } from 'react';

// 搜索条件
interface SearchListCardProps {
  otherDictListRecord: OtherDictListRecord;
  listReq: QuestionListReq;
  updateListReq: (key: keyof QuestionListReq, value: number | number[] | string) => void;
}

function SearchListCard({ otherDictListRecord, listReq, updateListReq }: SearchListCardProps) {
  return (
    <Card className="">
      <CardHeader className="px-3">
        <CardTitle className="text-sm font-semibold">条件筛选</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-0">
        <SearchList otherDictListRecord={otherDictListRecord} listReq={listReq} updateListReq={updateListReq} />
      </CardContent>
    </Card>
  );
}

// 试卷标题
function TitleInfoCard() {
  return (
    <Card className="p-3">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-sm font-semibold">基本信息</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-0">
        <div className="space-y-1.5">
          <Label htmlFor="exam-title" className="text-sm">
            试卷标题
          </Label>
          <Input id="exam-title" type="text" defaultValue="七年级下学期期末复习卷" className="h-10 px-3 text-xs" />
        </div>

        <div className="flex gap-2.5">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="exam-score" className="text-sm">
              总分
            </Label>
            <Input id="exam-score" type="number" defaultValue="100" className="h-10 px-3 text-xs" />
          </div>

          <div className="flex-1 space-y-1.5">
            <Label htmlFor="exam-duration" className="text-sm font-normal">
              时长（分钟）
            </Label>
            <Input id="exam-duration" type="number" defaultValue="90" className="h-10 px-3 text-xs" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 题型题量
function QuestionTypesCard() {
  const questionTypes = [
    {
      name: '单选题',
      count: 10,
      score: 3,
      description: '本大题共10小题，每小题3分，共30分。在每小题给出的四个选项中，只有一项是符合题目要求的。',
    },
    {
      name: '多选题',
      count: 5,
      score: 4,
      description: '本大题共5小题，每小题4分，共20分。在每小题给出的选项中，有多项符合题目要求。',
    },
    {
      name: '填空题',
      count: 5,
      score: 4,
      description: '本大题共5小题，每小题4分，共20分。请将答案填写在答题卡相应位置。',
    },
    {
      name: '解答题',
      count: 3,
      score: 10,
      description: '本大题共3小题，每小题10分，共30分。解答应写出文字说明、证明过程或演算步骤。',
    },
  ];

  return (
    <Card className="p-3">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-sm font-semibold">题型题量</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3.5 p-0">
        {questionTypes.map((t, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-15 shrink-0 text-sm font-medium">{t.name}</span>
              <Input type="number" defaultValue={t.count} className="h-8 w-20 px-2 text-center text-xs" />
              <span className="text-xs">题 ×</span>
              <Input type="number" defaultValue={t.score} className="h-8 w-20 px-2 text-center text-xs" />
              <span className="text-xs">分</span>
            </div>

            <div className="pl-17">
              <Input
                type="text"
                defaultValue={t.description}
                placeholder="请输入题型说明（如：本大题共X小题，每小题X分...）"
                className="h-8 text-xs"
              />
            </div>
          </div>
        ))}

        <div className="mt-1 flex justify-between border-t pt-3 text-sm">
          <span className="">合计</span>
          <span className="font-semibold tabular-nums">23题 · 100分</span>
        </div>
      </CardContent>
    </Card>
  );
}

// 难度分布
function DifficultyDistributionCard() {
  const difficultyLevels = [
    { name: '简单', percent: 30, textColor: 'text-emerald-600', barColor: 'bg-emerald-500' },
    { name: '中等', percent: 50, textColor: 'text-amber-600', barColor: 'bg-amber-500' },
    { name: '困难', percent: 20, textColor: 'text-rose-600', barColor: 'bg-rose-500' },
  ];

  return (
    <Card className="p-3">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-sm font-semibold">难度分布</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3.5 p-0">
        {difficultyLevels.map((d, i) => (
          <div key={i}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span>{d.name}</span>
              <span className={`font-semibold tabular-nums ${d.textColor}`}>{d.percent}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${d.barColor}`} style={{ width: `${d.percent}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LevelInfo() {
  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-50 px-3.5 py-2.5 text-xs leading-relaxed text-emerald-800">
      <div className="mb-1 flex items-center gap-1 font-semibold">
        <span className="text-[13px]">📊</span>
        已联动学情分层
      </div>

      <div>A卷 → A等级（拓展层）学生</div>
      <div>B卷 → B等级（提升层）学生</div>
      <div>C卷 → C等级（基础层）学生</div>

      <div className="mt-1 border-t border-dashed border-emerald-500/20 pt-1">
        💡 临界生建议交叉配置：A临界生 = A卷+B卷混合；B临界生 = B卷+C卷混合
      </div>
    </div>
  );
}

type LayerKey = 'A' | 'B' | 'C';
function LayerList() {
  const [activeLayer, setActiveLayer] = useState<LayerKey>('A');

  const layerConfigs: Record<
    LayerKey,
    {
      name: string;
      tierLabel: string;
      desc: string;
      types: { name: string; count: number; score: number }[];
      diff: { name: string; percent: number; barClass: string }[];
      totalQ: number;
      totalS: number;
      activeBorderClass: string;
      activeBgClass: string;
      textClass: string;
    }
  > = {
    A: {
      name: 'A卷',
      tierLabel: 'A等级（拓展层）',
      desc: '面向A等级学生，冲刺拓展 · 拓展变式与应用变式为主',
      types: [
        { name: '选择题', count: 8, score: 3 },
        { name: '填空题', count: 6, score: 3 },
        { name: '计算题', count: 4, score: 6 },
        { name: '解答题', count: 4, score: 8 },
        { name: '拓展探究', count: 2, score: 10 },
      ],
      diff: [
        { name: '提升题', percent: 30, barClass: 'bg-blue-500' },
        { name: '应用拓展', percent: 50, barClass: 'bg-violet-500' },
        { name: '拓展题', percent: 20, barClass: 'bg-red-500' },
      ],
      totalQ: 24,
      totalS: 100,
      activeBorderClass: 'border-2 border-violet-500',
      activeBgClass: 'bg-violet-500 text-white',
      textClass: 'text-violet-500',
    },
    B: {
      name: 'B卷',
      tierLabel: 'B等级（提升层）',
      desc: '面向B等级学生，巩固提升 · 提升变式为主',
      types: [
        { name: '选择题', count: 10, score: 3 },
        { name: '填空题', count: 8, score: 3 },
        { name: '计算题', count: 3, score: 6 },
        { name: '解答题', count: 3, score: 8 },
        { name: '拓展提升', count: 2, score: 8 },
      ],
      diff: [
        { name: '基础题', percent: 30, barClass: 'bg-emerald-500' },
        { name: '提升题', percent: 50, barClass: 'bg-blue-500' },
        { name: '拓展题', percent: 20, barClass: 'bg-red-500' },
      ],
      totalQ: 26,
      totalS: 100,
      activeBorderClass: 'border-2 border-blue-600',
      activeBgClass: 'bg-blue-600 text-white',
      textClass: 'text-blue-600',
    },
    C: {
      name: 'C卷',
      tierLabel: 'C等级（基础层）',
      desc: '面向C等级学生，夯实基础 · 基础变式为主',
      types: [
        { name: '选择题', count: 12, score: 3 },
        { name: '填空题', count: 8, score: 3 },
        { name: '计算题', count: 2, score: 6 },
        { name: '解答题', count: 2, score: 8 },
      ],
      diff: [
        { name: '基础题', percent: 70, barClass: 'bg-emerald-500' },
        { name: '提升题', percent: 30, barClass: 'bg-blue-500' },
      ],
      totalQ: 24,
      totalS: 100,
      activeBorderClass: 'border-2 border-amber-500',
      activeBgClass: 'bg-amber-500 text-white',
      textClass: 'text-amber-500',
    },
  };

  return (
    <div className="flex flex-col gap-3">
      {(Object.entries(layerConfigs) as [LayerKey, (typeof layerConfigs)[LayerKey]][]).map(([key, cfg]) => {
        const active = activeLayer === key;

        return (
          <Card
            key={key}
            onClick={() => setActiveLayer(key)}
            className={cn('cursor-pointer px-4 py-3.5 shadow-none transition-colors', active ? cfg.activeBorderClass : 'hover:border-gray-300')}
          >
            {/* 头部：字母徽章 + 标题与描述 */}
            <div className={cn('flex items-center', active && 'mb-2')}>
              <span
                className={cn(
                  'mr-2.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors',
                  active ? cfg.activeBgClass : 'bg-gray-200 text-gray-600',
                )}
              >
                {key}
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  {cfg.name} <span className={cn('ml-1 text-[11px] font-medium', cfg.textClass)}>↔ {cfg.tierLabel}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-gray-500">{cfg.desc}</div>
              </div>
            </div>

            {/* 展开详情区域 */}
            {active && (
              <div className="flex flex-col gap-2.5 border-t border-dashed border-gray-200 pt-2.5">
                <div className="-mb-1 text-[11px] font-medium text-gray-500">题型·分值配置</div>

                {cfg.types.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="w-16 text-gray-600">{t.name}</span>
                    <span className="font-medium tabular-nums text-gray-900">
                      {t.count}题 × {t.score}分
                    </span>
                    <span className="ml-auto text-[11px] tabular-nums text-gray-400">{t.count * t.score}分</span>
                  </div>
                ))}

                {/* 难度分布堆叠条 */}
                <div className="border-t border-gray-100 pt-2">
                  <div className="mb-1.5 text-[11px] font-medium text-gray-500">难度分布</div>
                  <div className="mb-1.5 flex h-2 overflow-hidden rounded bg-gray-100">
                    {cfg.diff.map((d, i) => (
                      <div key={i} className={cn('h-full', d.barClass)} style={{ width: `${d.percent}%` }} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cfg.diff.map((d, i) => (
                      <span key={i} className="flex items-center gap-1 text-[11px] text-gray-600">
                        <span className={cn('size-2 rounded-[2px]', d.barClass)} />
                        {d.name} {d.percent}%
                      </span>
                    ))}
                  </div>
                </div>

                {/* 底部合计 */}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-xs font-semibold text-gray-700">
                  <span className="tabular-nums">合计 {cfg.totalQ}题</span>
                  <span className={cn('tabular-nums', cfg.textClass)}>{cfg.totalS}分</span>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export { DifficultyDistributionCard, LayerList, LevelInfo, QuestionTypesCard, SearchListCard, TitleInfoCard };
