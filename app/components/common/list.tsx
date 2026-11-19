import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from 'cn';
import { type LucideIcon } from 'lucide-react';

// 通用状态选择器
interface ListSelectProps {
  options: { id: number; value: number; label: string }[];
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function ListSelect({ options = [], defaultValue = 0, onSelect }: ListSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      onSelect(0);
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-start">
      {options.map(({ id, value, label }) => (
        <Button key={id} variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 题目状态卡片筛选

export interface StatItem {
  id: number;
  title: string;
  value: number;
  icon: LucideIcon;
  count: number;
  desc?: string;
  theme: {
    dot: string;
    iconActive: string;
    ring: string;
  };
}

interface CardListProps {
  options: StatItem[];
  activeStatus: number;
  onSelectStatus: (status: number) => void;
}

function ListCard({ options, activeStatus, onSelectStatus }: CardListProps) {
  return (
    <section className="py-2">
      <div className="grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {options.map((item) => {
          const isActive = activeStatus === item.value;

          return (
            <Card
              key={item.id}
              onClick={() => onSelectStatus?.(item.value)}
              className={cn(
                'group relative border bg-card py-0 shadow-none transition-all duration-150 select-none',
                'cursor-pointer',
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
                      <span className="text-lg font-bold leading-none tracking-tight text-foreground tabular-nums">{item.count}</span>
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

export { ListCard, ListSelect };
