import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuestionStatus } from '@/type/enum';
import { StringConst } from '@/util/string';
import { cn } from 'cn';
import { Check, Clock, FileQuestion, PencilLine, X, type LucideIcon } from 'lucide-react';

// 题目状态卡片筛选

export interface StatItem {
  id: number;
  title: string;
  value: QuestionStatus;
  count: number;
  icon: LucideIcon;
  desc?: string;
  theme: {
    dot: string;
    iconActive: string;
    ring: string;
  };
}

export const DEFAULT_STAT_LIST: StatItem[] = [
  {
    id: 1,
    title: '全部题目',
    value: QuestionStatus.None,
    count: 0,
    icon: FileQuestion,
    desc: '我的全部题目',
    theme: {
      dot: 'bg-blue-500',
      iconActive: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      ring: 'border-blue-500/60 ring-2 ring-blue-500/10',
    },
  },
  {
    id: 2,
    title: '草稿中',
    value: QuestionStatus.Drafing,
    count: 0,
    icon: PencilLine,
    desc: '可编辑的题目',
    theme: {
      dot: 'bg-zinc-400',
      iconActive: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
      ring: 'border-zinc-500/60 ring-2 ring-zinc-500/10',
    },
  },
  {
    id: 3,
    title: '已通过',
    value: QuestionStatus.Published,
    count: 0,
    icon: Check,
    desc: '所有人可查看',
    theme: {
      dot: 'bg-emerald-500',
      iconActive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      ring: 'border-emerald-500/60 ring-2 ring-emerald-500/10',
    },
  },
  {
    id: 4,
    title: '待审核',
    value: QuestionStatus.Pending,
    count: 0,
    icon: Clock,
    desc: '不可编辑待他人审核',
    theme: {
      dot: 'bg-amber-500',
      iconActive: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      ring: 'border-amber-500/60 ring-2 ring-amber-500/10',
    },
  },
  {
    id: 5,
    title: '未通过',
    value: QuestionStatus.Rejected,
    count: 0,
    icon: X,
    desc: '按拒绝理由修改',
    theme: {
      dot: 'bg-rose-500',
      iconActive: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      ring: 'border-rose-500/60 ring-2 ring-rose-500/10',
    },
  },
];

interface StatusListProps {
  items?: StatItem[];
  count?: number;
  activeStatus?: QuestionStatus;
  onSelectStatus?: (status: QuestionStatus) => void;
}

function StatusList({ items = DEFAULT_STAT_LIST, count, activeStatus = QuestionStatus.None, onSelectStatus }: StatusListProps) {
  return (
    <section className="py-2">
      <div className="grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => {
          const isActive = activeStatus === item.value;
          const displayCount = item.count ?? count ?? 0;

          return (
            <Card
              key={item.id}
              onClick={() => onSelectStatus?.(item.value)}
              className={cn(
                'group relative border bg-card py-0 shadow-none transition-all duration-150 select-none',
                onSelectStatus && 'cursor-pointer',
                isActive ? cn('bg-cyan-50', item.theme.ring) : 'border-border/60 hover:border-border hover:bg-muted/30',
              )}
            >
              <CardContent className="px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', item.theme.dot)} />
                      <span
                        className={cn(
                          'truncate text-sm transition-colors',
                          isActive ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground',
                        )}
                      >
                        {item.title}
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline gap-1 pl-3">
                      <span className="text-lg font-bold leading-none tracking-tight text-foreground tabular-nums">{displayCount}</span>
                      <span className="text-xs text-muted-foreground">道</span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-150',
                      isActive ? item.theme.iconActive : 'bg-muted/60 text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>

                {item.desc && (
                  <p className="mt-1.5 truncate pl-3 text-xs leading-tight text-muted-foreground" title={item.desc}>
                    {item.desc}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

// 题目状态选择器
interface StatusSelectProps {
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function StatusSelect({ defaultValue = 0, onSelect }: StatusSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.questionStatusList.map(({ id, value, label }) => (
        <Button key={id} variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

export { StatusList, StatusSelect };
