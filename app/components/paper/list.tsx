import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Calendar, CheckCircle2, Clock, Crown, Download, Eye, FileText, MapPin, User } from 'lucide-react';

export type PaperLevelType = 1 | 2;
export type PaperDifficultyType = 1 | 2 | 3;

export interface PaperListItem {
  id: number;
  title: string;
  levelType: PaperLevelType;
  difficultyType: PaperDifficultyType;
  year: string;
  provinceName: string;
  cityName?: string;
  schoolName?: string;
  downloadCount: number;
  authorName: string;
  createdAt: string;
  approvedAt?: string;
}

interface PaperListProps {
  items?: PaperListItem[];
  onPreview?: (item: PaperListItem) => void;
  onDownload?: (item: PaperListItem) => void;
}

const DIFFICULTY_CONFIG: Record<PaperDifficultyType, { label: string; className: string }> = {
  1: {
    label: '容易',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
  },
  2: {
    label: '适中',
    className: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50',
  },
  3: {
    label: '困难',
    className: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50',
  },
};

export const MOCK_PAPER_LIST: PaperListItem[] = [
  {
    id: 1001,
    title: '2026届高三第一次模拟考试数学（理科）全真预测卷',
    levelType: 2,
    difficultyType: 3,
    year: '2026',
    provinceName: '广东省',
    cityName: '深圳市',
    schoolName: '深圳中学',
    downloadCount: 3428,
    authorName: '陈明哲老师',
    createdAt: '2026-03-12 09:40',
    approvedAt: '2026-03-12 11:15',
  },
  {
    id: 1002,
    title: '2026年春季九年级下学期期中质量检测语文试卷（含解析）',
    levelType: 2,
    difficultyType: 2,
    year: '2026',
    provinceName: '浙江省',
    cityName: '杭州市',
    schoolName: '杭州第二中学',
    downloadCount: 1895,
    authorName: '林若雪',
    createdAt: '2026-04-08 14:20',
    approvedAt: '2026-04-08 16:05',
  },
  {
    id: 1003,
    title: '2026年八年级物理上册《力学基础》单元测试练习卷',
    levelType: 1,
    difficultyType: 1,
    year: '2026',
    provinceName: '江苏省',
    cityName: '南京市',
    schoolName: '南京外国语学校',
    downloadCount: 964,
    authorName: '周建国',
    createdAt: '2026-05-19 10:12',
    approvedAt: '2026-05-19 10:50',
  },
  {
    id: 1004,
    title: '2025-2026学年高二下学期期末联合调研英语学科试题',
    levelType: 2,
    difficultyType: 2,
    year: '2026',
    provinceName: '四川省',
    cityName: '成都市',
    schoolName: '成都七中',
    downloadCount: 2710,
    authorName: '苏婉清',
    createdAt: '2026-06-25 18:30',
    approvedAt: '2026-06-26 09:00',
  },
  {
    id: 1005,
    title: '2026年中考冲刺化学实验探究与计算专题突破卷',
    levelType: 1,
    difficultyType: 3,
    year: '2026',
    provinceName: '湖北省',
    downloadCount: 612,
    authorName: '张远航',
    createdAt: '2026-07-02 15:45',
  },
];

export default function PaperList({ items = MOCK_PAPER_LIST, onPreview, onDownload }: PaperListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isPremium = item.levelType === 2;
        const difficulty = DIFFICULTY_CONFIG[item.difficultyType];
        const regionText = item.cityName ? `${item.provinceName} · ${item.cityName}` : item.provinceName;

        return (
          <Card key={item.id} className="group transition-all duration-200 hover:border-primary/40 hover:shadow-md">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {isPremium ? (
                      <Badge className="gap-1 border-amber-300 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs hover:from-amber-500 hover:to-orange-500">
                        <Crown className="h-3 w-3" />
                        精品
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-normal">
                        普通
                      </Badge>
                    )}

                    <Badge variant="outline" className={difficulty.className}>
                      难度：{difficulty.label}
                    </Badge>

                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {item.year}年
                    </Badge>

                    <h3
                      onClick={() => onPreview?.(item)}
                      className="cursor-pointer truncate text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg"
                    >
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {regionText}
                    </span>

                    {item.schoolName && (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {item.schoolName}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {item.authorName}
                    </span>

                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
                      <Download className="h-3.5 w-3.5 text-primary/70" />
                      {item.downloadCount.toLocaleString()} 次下载
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      创建时间：{item.createdAt}
                    </span>

                    {item.approvedAt ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        审核通过：{item.approvedAt}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600">
                        <FileText className="h-3.5 w-3.5" />
                        审核状态：待审核
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end lg:self-center">
                  <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onPreview?.(item)}>
                    <Eye className="h-4 w-4" />
                    预览
                  </Button>
                  <Button type="button" size="sm" className="gap-1.5" onClick={() => onDownload?.(item)}>
                    <Download className="h-4 w-4" />
                    下载试卷
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
