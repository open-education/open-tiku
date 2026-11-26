import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  History,
  Play,
  Repeat,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { NavLink } from 'react-router';

// 1. 类型定义
export type AssignmentType = 'homework' | 'practice' | 'correction';

export interface AttemptRecord {
  attemptId: string;
  attemptNumber: number;
  status: 'in_progress' | 'completed';
  submittedAt?: string;
  updatedAt: string;
  answeredCount: number;
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  score?: number;
}

export interface AssignmentItem {
  id: string;
  type: AssignmentType;
  title: string;
  subject: string;
  deadline?: string;
  isOverdue?: boolean;
  attemptCount: number;
  maxAttempts?: number;
  latestProgress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    answeredCount: number;
    totalCount: number;
    correctCount: number;
    wrongCount: number;
  };
  history: AttemptRecord[];
}

// 2. 类型配置映射（图标、文案、配色）
const TYPE_CONFIG: Record<
  AssignmentType,
  {
    label: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    badgeClass: string;
  }
> = {
  homework: {
    label: '作业',
    icon: FileText,
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-transparent',
  },
  practice: {
    label: '练习',
    icon: BookOpenCheck,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-transparent',
  },
  correction: {
    label: '订正',
    icon: RotateCcw,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    badgeClass: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-transparent',
  },
};

// 3. 模拟数据
const MOCK_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: '1',
    type: 'correction',
    subject: '数学',
    title: '第三单元《小数除法》错题专项订正',
    deadline: '今天 20:00 截止',
    isOverdue: false,
    attemptCount: 1,
    latestProgress: {
      status: 'in_progress',
      answeredCount: 3,
      totalCount: 8,
      correctCount: 2,
      wrongCount: 1,
    },
    history: [
      {
        attemptId: 'att-101',
        attemptNumber: 1,
        status: 'in_progress',
        updatedAt: '10分钟前',
        answeredCount: 3,
        totalCount: 8,
        correctCount: 2,
        wrongCount: 1,
      },
    ],
  },
  {
    id: '2',
    type: 'homework',
    subject: '语文',
    title: '期中综合能力测评卷（A卷）',
    deadline: '2026-11-28 21:00',
    isOverdue: false,
    attemptCount: 2,
    latestProgress: {
      status: 'completed',
      answeredCount: 20,
      totalCount: 20,
      correctCount: 17,
      wrongCount: 3,
    },
    history: [
      {
        attemptId: 'att-202',
        attemptNumber: 2,
        status: 'completed',
        submittedAt: '昨天 19:30',
        updatedAt: '昨天 19:30',
        answeredCount: 20,
        totalCount: 20,
        correctCount: 17,
        wrongCount: 3,
        score: 85,
      },
      {
        attemptId: 'att-201',
        attemptNumber: 1,
        status: 'completed',
        submittedAt: '前天 18:15',
        updatedAt: '前天 18:15',
        answeredCount: 20,
        totalCount: 20,
        correctCount: 14,
        wrongCount: 6,
        score: 70,
      },
    ],
  },
  {
    id: '3',
    type: 'practice',
    subject: '英语',
    title: 'Unit 4 一般过去时动词变形随堂巩固',
    deadline: '2026-11-30 23:59',
    isOverdue: false,
    attemptCount: 0,
    latestProgress: {
      status: 'not_started',
      answeredCount: 0,
      totalCount: 15,
      correctCount: 0,
      wrongCount: 0,
    },
    history: [],
  },
];

// 作业详情
function HomeworkInfo({
  item,
  onStart,
  onContinue,
  onViewReport,
}: {
  item: AssignmentItem;
  onStart?: (item: AssignmentItem) => void;
  onContinue?: (item: AssignmentItem, attemptId?: string) => void;
  onViewReport?: (item: AssignmentItem, attemptId?: string) => void;
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const config = TYPE_CONFIG[item.type];
  const IconComponent = config.icon;
  const progress = item.latestProgress;

  // 计算进度百分比
  const progressPercent = progress && progress.totalCount > 0 ? Math.round((progress.answeredCount / progress.totalCount) * 100) : 0;

  // 判断主按钮的状态和文案
  const renderPrimaryAction = () => {
    if (!progress || progress.status === 'not_started') {
      return (
        <NavLink to="/student/homework/exam">
          <Button className="gap-1.5 shadow-xs font-medium" onClick={() => onStart?.(item)}>
            <Play className="w-4 h-4 fill-current" />
            开始作答
          </Button>
        </NavLink>
      );
    }

    if (progress.status === 'in_progress') {
      const latestAttempt = item.history[0];
      return (
        <NavLink to="/student/homework/exam">
          <Button
            className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-medium"
            onClick={() => onContinue?.(item, latestAttempt?.attemptId)}
          >
            <Play className="w-4 h-4 fill-current" />
            继续作答
          </Button>
        </NavLink>
      );
    }

    // 已完成状态
    const latestAttempt = item.history[0];
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-1.5 font-medium" onClick={() => onViewReport?.(item, latestAttempt?.attemptId)}>
          <Eye className="w-4 h-4" />
          查看解析
        </Button>
        <Button className="gap-1.5 shadow-xs font-medium" onClick={() => onStart?.(item)}>
          <Repeat className="w-4 h-4" />
          {item.type === 'correction' ? '再次订正' : '再做一遍'}
        </Button>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-slate-200/90 bg-card">
      {/* 卡片主体区域 */}
      <div className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 左侧 + 中间信息区 */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* 左侧：类型大图标 */}
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${config.iconBg}`}>
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          </div>

          {/* 中间：标签、标题、状态指标 */}
          <div className="flex-1 min-w-0 space-y-2.5">
            {/* 第一行：类型标签 + 学科 + 标题 */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}>{config.label}</Badge>
              <Badge variant="outline" className="text-xs text-slate-600 bg-slate-50">
                {item.subject}
              </Badge>
              <h3 className="text-sm font-bold text-slate-800 truncate">{item.title}</h3>
            </div>

            {/* 第二行：截止时间 + 做题次数 + 上次做题战绩 */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-500">
              {/* 截止时间 */}
              {item.deadline && (
                <span className={`flex items-center gap-1.5 ${item.isOverdue ? 'text-red-600 font-medium' : ''}`}>
                  {item.isOverdue ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-slate-400" />}
                  {item.deadline}
                </span>
              )}

              {/* 累计作答次数 */}
              <span className="flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-slate-400" />
                已作答 <strong className="text-slate-700 font-semibold">{item.attemptCount}</strong> 次
              </span>

              {/* 上次进度与对错统计 */}
              {progress && progress.status !== 'not_started' ? (
                <div className="flex items-center gap-3 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  <span className="text-slate-600">
                    最近进度:{' '}
                    <strong className="text-slate-800">
                      {progress.answeredCount}/{progress.totalCount}题
                    </strong>
                  </span>
                  <span className="h-3 w-[1px] bg-slate-200" />
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {progress.correctCount}
                  </span>
                  <span className="flex items-center gap-1 text-rose-600 font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    {progress.wrongCount}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400">共 {progress?.totalCount ?? 0} 题 · 尚未开始</span>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：操作按钮组 */}
        <div className="flex items-center justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          {/* 作答历史切换按钮 */}
          {item.history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`gap-1.5 text-slate-600 hover:text-slate-900 ${isHistoryOpen ? 'bg-slate-100 text-slate-900' : ''}`}
            >
              <History className="w-4 h-4" />
              作答历史 ({item.history.length}){isHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          )}

          {/* 主行动按钮 */}
          {renderPrimaryAction()}
        </div>
      </div>

      {/* 展开区域：作答历史明细 */}
      {isHistoryOpen && item.history.length > 0 && (
        <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <div className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center justify-between">
            <span>历史作答记录（按时间倒序）</span>
            <span>共 {item.history.length} 条记录</span>
          </div>

          <div className="space-y-2">
            {item.history.map((record) => {
              const isInProgress = record.status === 'in_progress';
              return (
                <div
                  key={record.attemptId}
                  className="bg-white rounded-lg border border-slate-200/80 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                >
                  {/* 左侧次序与时间 */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="font-mono text-xs bg-slate-100 text-slate-700">
                      第 {record.attemptNumber} 次
                    </Badge>

                    {isInProgress ? (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 text-xs">进行中</Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs">已完成</Badge>
                    )}

                    <span className="text-xs text-slate-500">
                      {isInProgress ? `上次保存：${record.updatedAt}` : `交卷时间：${record.submittedAt}`}
                    </span>
                  </div>

                  {/* 中间数据 + 右侧单条操作按钮 */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-600">
                        进度 {record.answeredCount}/{record.totalCount}
                      </span>
                      <span className="text-emerald-600 font-medium">对 {record.correctCount}</span>
                      <span className="text-rose-600 font-medium">错 {record.wrongCount}</span>
                      {record.score !== undefined && (
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{record.score} 分</span>
                      )}
                    </div>

                    {/* 单条历史操作按钮 */}
                    {isInProgress ? (
                      <NavLink to="/student/homework/exam">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs bg-amber-600 hover:bg-amber-700"
                          onClick={() => onContinue?.(item, record.attemptId)}
                        >
                          继续作答
                        </Button>
                      </NavLink>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onViewReport?.(item, record.attemptId)}>
                        查看详情
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

// 作业列表
function HomeWorkList({ assignments = MOCK_ASSIGNMENTS }: { assignments?: AssignmentItem[] }) {
  const [filterType, setFilterType] = useState<'all' | AssignmentType>('all');

  const filteredList = filterType === 'all' ? assignments : assignments.filter((item) => item.type === filterType);

  return (
    <div className="space-y-3">
      {/* 顶部标题与快捷筛选 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-3">
        <div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">我的学习任务</h1>
          <p className="text-xs text-slate-500 mt-1">按时完成作业与练习，错题记得及时订正哦</p>
        </div>

        {/* 类型切换胶囊 */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start">
          {[
            { key: 'all', label: '全部' },
            { key: 'homework', label: '作业' },
            { key: 'practice', label: '练习' },
            { key: 'correction', label: '订正' },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant="outline"
              onClick={() => setFilterType(tab.key as 'all' | AssignmentType)}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                filterType === tab.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 作业卡片列表 */}
      <div className="space-y-3">
        {filteredList.map((item) => (
          <HomeworkInfo key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export { HomeWorkList };
