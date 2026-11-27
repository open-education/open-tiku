import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的工作台' },
    {
      name: 'description',
      content: '我的数据汇总',
    },
  ];
}

// ==========================================
// 1. 学生端统一跳转路由配置（后续替换为你的实际路由路径即可）
// ==========================================
export const STUDENT_DASHBOARD_ROUTES = {
  homeworkList: '/student/homework?type=homework',
  practiceList: '/student/homework?type=practice',
  correctionList: '/student/homework?type=correction',
  mistakeBook: '/student/mistakes',
  examHistory: '/student/history',
  knowledgeAnalysis: '/student/analytics/knowledge',
  examRoom: '/student/homework/exam',
} as const;

// ==========================================
// 2. 类型定义与模拟数据
// ==========================================
export interface StudentMonthlyTrendPoint {
  month: string;
  solvedQuestions: number; // 近一年每月刷题总数
  accuracyRate: number; // 近一年每月平均正确率（%）
  completedPapers: number; // 近一年每月完成试卷/练习套数
  correctedMistakes: number; // 近一年每月订正消灭错题数
}

export interface StudentDashboardProps {
  /** 传入 React Router 的 navigate 函数即可自动处理跳转 */
  onNavigate?: (path: string) => void;
}

const STUDENT_TREND_DATA: StudentMonthlyTrendPoint[] = [
  { month: '12月', solvedQuestions: 185, accuracyRate: 74, completedPapers: 8, correctedMistakes: 32 },
  { month: '1月', solvedQuestions: 240, accuracyRate: 76, completedPapers: 11, correctedMistakes: 45 },
  { month: '2月', solvedQuestions: 150, accuracyRate: 78, completedPapers: 6, correctedMistakes: 28 },
  { month: '3月', solvedQuestions: 310, accuracyRate: 77, completedPapers: 14, correctedMistakes: 58 },
  { month: '4月', solvedQuestions: 365, accuracyRate: 80, completedPapers: 16, correctedMistakes: 64 },
  { month: '5月', solvedQuestions: 390, accuracyRate: 81, completedPapers: 18, correctedMistakes: 70 },
  { month: '6月', solvedQuestions: 450, accuracyRate: 83, completedPapers: 21, correctedMistakes: 85 },
  { month: '7月', solvedQuestions: 210, accuracyRate: 84, completedPapers: 9, correctedMistakes: 40 },
  { month: '8月', solvedQuestions: 260, accuracyRate: 85, completedPapers: 12, correctedMistakes: 48 },
  { month: '9月', solvedQuestions: 380, accuracyRate: 84, completedPapers: 17, correctedMistakes: 66 },
  { month: '10月', solvedQuestions: 420, accuracyRate: 86, completedPapers: 19, correctedMistakes: 74 },
  { month: '11月', solvedQuestions: 468, accuracyRate: 88, completedPapers: 22, correctedMistakes: 82 },
];

const SUBJECT_MASTERY = [
  { subject: '数学', solved: 1420, accuracy: 86, pendingMistakes: 6, color: 'bg-blue-500' },
  { subject: '英语', solved: 1180, accuracy: 91, pendingMistakes: 3, color: 'bg-emerald-500' },
  { subject: '语文', solved: 760, accuracy: 84, pendingMistakes: 4, color: 'bg-amber-500' },
  { subject: '物理', solved: 468, accuracy: 81, pendingMistakes: 5, color: 'bg-purple-500' },
];

const URGENT_TASKS = [
  {
    id: 't1',
    type: 'correction' as const,
    typeLabel: '订正',
    subject: '数学',
    title: '第三单元《小数除法》错题专项订正',
    deadline: '今天 20:00 截止',
    progressText: '已答 3/8 题',
    actionText: '继续订正',
  },
  {
    id: 't2',
    type: 'homework' as const,
    typeLabel: '作业',
    subject: '英语',
    title: 'Unit 4 一般过去时随堂达标测试卷',
    deadline: '明天 21:00 截止',
    progressText: '尚未开始（共 20 题）',
    actionText: '开始作答',
  },
  {
    id: 't3',
    type: 'practice' as const,
    typeLabel: '练习',
    subject: '物理',
    title: '光的折射与透镜成像规律巩固练习',
    deadline: '本周五截止',
    progressText: '已答 6/15 题',
    actionText: '继续练习',
  },
];

// ==========================================
// 3. 纯原生轻量级 SVG 趋势图组件（零第三方依赖）
// ==========================================
function NativeTrendChart({
  title,
  subtitle,
  data,
  dataKey,
  unit,
  strokeColor,
  fillId,
  badgeText,
  badgeClass,
}: {
  title: string;
  subtitle: string;
  data: StudentMonthlyTrendPoint[];
  dataKey: keyof Omit<StudentMonthlyTrendPoint, 'month'>;
  unit: string;
  strokeColor: string;
  fillId: string;
  badgeText: string;
  badgeClass?: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const values = data.map((d) => Number(d[dataKey]));
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const paddedMax = maxVal === minVal ? maxVal + 10 : maxVal + (maxVal - minVal) * 0.15;
  const paddedMin = Math.max(0, minVal - (maxVal - minVal) * 0.15);

  const width = 560;
  const height = 200;
  const padX = 28;
  const padTop = 20;
  const padBottom = 28;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const points = data.map((item, idx) => {
    const x = padX + (idx / (data.length - 1)) * chartW;
    const ratio = (Number(item[dataKey]) - paddedMin) / (paddedMax - paddedMin || 1);
    const y = padTop + chartH - ratio * chartH;
    return { x, y, month: item.month, value: Number(item[dataKey]) };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M ${points[0].x},${padTop + chartH} L ${points
    .map((p) => `${p.x},${p.y}`)
    .join(' L ')} L ${points[points.length - 1].x},${padTop + chartH} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <Card className="border-slate-200/90 shadow-xs bg-white">
      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base font-bold text-slate-800">{title}</CardTitle>
            <Badge variant="secondary" className={`text-xs font-medium ${badgeClass ?? ''}`}>
              {badgeText}
            </Badge>
          </div>
          <CardDescription className="text-xs mt-1">{subtitle}</CardDescription>
        </div>

        <div className="text-right shrink-0 ml-2">
          <div className="text-xs text-slate-400">{activePoint.month}数据</div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">
            {activePoint.value.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-1">{unit}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-1">
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible select-none" onMouseLeave={() => setHoverIndex(null)}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((step, i) => {
              const gridY = padTop + chartH * step;
              return <line key={i} x1={padX} y1={gridY} x2={width - padX} y2={gridY} stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />;
            })}

            <path d={areaPath} fill={`url(#${fillId})`} />

            <polyline fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polylinePoints} />

            {hoverIndex !== null && (
              <line
                x1={points[hoverIndex].x}
                y1={padTop}
                x2={points[hoverIndex].x}
                y2={padTop + chartH}
                stroke={strokeColor}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}

            {points.map((p, idx) => {
              const isHovered = hoverIndex === idx;
              return (
                <g key={p.month}>
                  <text
                    x={p.x}
                    y={height - 6}
                    textAnchor="middle"
                    className={`text-[11px] ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'}`}
                  >
                    {p.month}
                  </text>

                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 4.5 : 2.8}
                    fill="#ffffff"
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 2.5 : 2}
                    className="transition-all duration-150"
                  />

                  <rect
                    x={p.x - chartW / data.length / 2}
                    y={0}
                    width={chartW / data.length}
                    height={height}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(idx)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 4. 学生个人学习工作台主组件
// ==========================================
export default function StudentDashboardPage({ onNavigate }: StudentDashboardProps) {
  const handleJump = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      console.log('跳转到学生端页面:', path);
    }
  };

  const stats = {
    pendingHomework: 2, // 待完成作业数
    pendingPractice: 3, // 待完成练习数
    pendingCorrection: 18, // 待订正错题数（未消灭错题）
    totalSolvedQuestions: 3828, // 累计刷题总数
    overallAccuracy: 85.4, // 综合平均正确率
    completedPapers: 173, // 累计完成试卷/练习套数
    avgScore: 87.5, // 近期测试平均分
    streakDays: 12, // 连续打卡学习天数
    masteredMistakes: 692, // 累计已订正掌握错题数
  };

  return (
    <div className="p-3 space-y-3 bg-slate-50/50 min-h-screen">
      {/* 1. 顶部欢迎语与快捷学习入口 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">我的学习工作台</h1>
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-transparent gap-1">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              已连续学习 {stats.streakDays} 天
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">今日事今日毕，先消灭待订正错题，再完成新作业效果更好哦</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            className="gap-1.5 bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
            onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.correctionList)}
          >
            <RotateCcw className="w-4 h-4" />
            去订正错题
          </Button>
          <Button variant="outline" className="gap-1.5 bg-white" onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.practiceList)}>
            <BookOpenCheck className="w-4 h-4" />
            自主练习
          </Button>
          <Button className="gap-1.5" onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.homeworkList)}>
            <FileText className="w-4 h-4" />
            去做作业
          </Button>
        </div>
      </div>

      {/* 2. 顶部三联待办任务卡（作业 / 练习 / 订正，直接对应学生核心任务流） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 待完成作业 */}
        <Card
          onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.homeworkList)}
          className="border-blue-200/80 bg-blue-50/60 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-blue-300 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-800">待完成作业</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-blue-950">{stats.pendingHomework}</span>
                  <span className="text-xs text-blue-700">份未交卷</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-blue-800 group-hover:bg-blue-100 gap-1">
              去作答 <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* 待完成练习 */}
        <Card
          onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.practiceList)}
          className="border-emerald-200/80 bg-emerald-50/60 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-emerald-300 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-800">进行中/待练巩固</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-emerald-950">{stats.pendingPractice}</span>
                  <span className="text-xs text-emerald-700">套随堂练习</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-emerald-800 group-hover:bg-emerald-100 gap-1">
              去练习 <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* 待订正错题 */}
        <Card
          onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.correctionList)}
          className="border-amber-200/80 bg-amber-50/60 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-amber-300 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-800">待订正错题数</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-amber-950">{stats.pendingCorrection}</span>
                  <span className="text-xs text-amber-700">道错题待消灭</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-amber-800 group-hover:bg-amber-100 gap-1">
              去订正 <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3. 我的学习成长数据统计（6卡片网格，全部带有“去查看”跳转入口） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 累计刷题总数 */}
        <Card
          onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.examHistory)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-blue-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">累计作答题目总数</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-blue-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Target className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.totalSolvedQuestions.toLocaleString()}</span>
              <span className="text-xs text-slate-500">道题</span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                本月已完成 <strong className="text-slate-700">468</strong> 道，超越全班 86% 同学
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 综合平均正确率 */}
        <Card
          onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.knowledgeAnalysis)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-emerald-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">综合做题正确率</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.overallAccuracy}%</span>
              <span className="text-xs text-slate-500">首次作答准确率</span>
            </div>
            <div className="mt-2.5 text-xs text-emerald-600 font-medium">较上月提升 +2.1% · 英语正确率最高（91%）</div>
          </CardContent>
        </Card>

        {/* 累计完成试卷/练习数 */}
        <Card
          onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.examHistory)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-indigo-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">累计完成试卷/练习</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.completedPapers}</span>
              <span className="text-xs text-slate-500">份交卷记录</span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500">
              含正式作业 <strong className="text-slate-700">68</strong> 份 · 巩固练习 <strong className="text-slate-700">105</strong> 份
            </div>
          </CardContent>
        </Card>

        {/* 近期测评平均分 */}
        <Card
          onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.examHistory)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-amber-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">近期测试平均分</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-amber-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Award className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.avgScore}</span>
              <span className="text-xs text-slate-500">分（百分制折算）</span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500">
              高于班级平均分（82.6分）<strong className="text-amber-600">+4.9 分</strong>
            </div>
          </CardContent>
        </Card>

        {/* 累计已消灭错题数 */}
        <Card
          onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.mistakeBook)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-purple-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">错题本累计消灭错题</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-purple-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.masteredMistakes}</span>
              <span className="text-xs text-slate-500">道已重做掌握</span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500">
              错题订正掌握率 <strong className="text-purple-600">97.4%</strong>
            </div>
          </CardContent>
        </Card>

        {/* 薄弱知识点提醒 */}
        <Card
          onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.knowledgeAnalysis)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-rose-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">近期薄弱知识点提示</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-rose-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 truncate">一次函数图像与性质</span>
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
              <span>近两周该考点错误 5 次，建议专项强化</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. 近一年学习成长 4 大趋势图全部同屏展示（2×2 网格） */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">近一年学习成长曲线</h2>
          <p className="text-xs text-slate-500">记录你过去 12 个月的做题量积累、正确率提升、完成试卷数与错题订正变化</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 图表 1：近一年每月刷题数量趋势 */}
          <NativeTrendChart
            title="近一年每月作答题目数量"
            subtitle="每月累计完成作答的试题总量（单位：道）"
            data={STUDENT_TREND_DATA}
            dataKey="solvedQuestions"
            unit="道"
            strokeColor="#2563eb"
            fillId="studentSolvedGradient"
            badgeText="刷题积累"
            badgeClass="bg-blue-50 text-blue-700"
          />

          {/* 图表 2：近一年做题正确率变化趋势 */}
          <NativeTrendChart
            title="近一年做题平均正确率趋势"
            subtitle="每月首答平均正确率变化曲线（单位：%）"
            data={STUDENT_TREND_DATA}
            dataKey="accuracyRate"
            unit="%"
            strokeColor="#059669"
            fillId="studentAccuracyGradient"
            badgeText="准确率成长"
            badgeClass="bg-emerald-50 text-emerald-700"
          />

          {/* 图表 3：近一年完成试卷/练习套数趋势 */}
          <NativeTrendChart
            title="近一年完成试卷与练习数"
            subtitle="每月按时提交的作业卷与练习卷数量（单位：套）"
            data={STUDENT_TREND_DATA}
            dataKey="completedPapers"
            unit="套"
            strokeColor="#7c3aed"
            fillId="studentPapersGradient"
            badgeText="任务完成"
            badgeClass="bg-purple-50 text-purple-700"
          />

          {/* 图表 4：近一年错题订正消灭数量趋势 */}
          <NativeTrendChart
            title="近一年错题本订正消灭趋势"
            subtitle="每月成功重做并掌握的错题数量（单位：道）"
            data={STUDENT_TREND_DATA}
            dataKey="correctedMistakes"
            unit="道"
            strokeColor="#d97706"
            fillId="studentMistakesGradient"
            badgeText="错题清零"
            badgeClass="bg-amber-50 text-amber-700"
          />
        </div>
      </div>

      {/* 5. 底部细化看板：急需处理的任务快捷列表 + 各学科掌握度分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧 2/3：急需处理的任务（支持一键直达作答页） */}
        <Card className="lg:col-span-2 bg-white border-slate-200/90 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  近期截止与进行中任务
                </CardTitle>
                <CardDescription className="text-xs mt-1">优先完成即将截止的作业与未做完的错题订正</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 gap-1"
                onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.homeworkList)}
              >
                查看全部任务 <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {URGENT_TASKS.map((task) => {
                const badgeStyle =
                  task.type === 'correction'
                    ? 'bg-amber-100 text-amber-700'
                    : task.type === 'homework'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700';

                return (
                  <div key={task.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs border-transparent ${badgeStyle}`}>{task.typeLabel}</Badge>
                        <Badge variant="outline" className="text-xs text-slate-600">
                          {task.subject}
                        </Badge>
                        <span className="font-semibold text-sm text-slate-800 truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{task.deadline}</span>
                        <span>·</span>
                        <span>{task.progressText}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={task.type === 'correction' ? 'default' : 'outline'}
                      className={`shrink-0 gap-1.5 ${task.type === 'correction' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                      onClick={() => handleJump(`${STUDENT_DASHBOARD_ROUTES.examRoom}?id=${task.id}`)}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {task.actionText}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 右侧 1/3：各学科正确率与待订正错题分布 */}
        <Card className="bg-white border-slate-200/90 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                各学科学习表现
              </CardTitle>
              <CardDescription className="text-xs mt-1">按学科查看正确率与剩余待订正错题</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 h-7 px-2 gap-0.5"
              onClick={() => handleJump(STUDENT_DASHBOARD_ROUTES.mistakeBook)}
            >
              错题本 <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUBJECT_MASTERY.map((item) => (
              <div key={item.subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="font-medium text-slate-700">{item.subject}</span>
                    <span className="text-xs text-slate-400">({item.solved}题)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    {item.pendingMistakes > 0 && (
                      <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">待订正 {item.pendingMistakes}</span>
                    )}
                    <span className="font-bold text-slate-800 tabular-nums">{item.accuracy}%</span>
                  </div>
                </div>
                <Progress value={item.accuracy} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
