import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileQuestion,
  FileSpreadsheet,
  Layers,
  Plus,
  Send,
  TrendingUp,
  Users,
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
// 1. 统一跳转路由配置（后续替换为你的实际路由路径即可）
// ==========================================
export const DASHBOARD_ROUTES = {
  createQuestion: '/teacher/questions/create',
  createPaper: '/teacher/papers/create',
  assignHomework: '/teacher/homework/assign',
  reviewQuestions: '/teacher/review/questions',
  reviewPapers: '/teacher/review/papers',
  gradeHomework: '/teacher/homework/grade',
  myQuestions: '/teacher/questions/mine',
  myPapers: '/teacher/papers/mine',
  homeworkHistory: '/teacher/homework/list',
  myClasses: '/teacher/classes',
  gradeAnalytics: '/teacher/analytics/grades',
  mistakeAnalytics: '/teacher/analytics/mistakes',
} as const;

// ==========================================
// 2. 类型定义与模拟数据
// ==========================================
export interface MonthlyTrendPoint {
  month: string;
  siteQuestions: number; // 近一年网站总题目数量
  sitePapers: number; // 近一年网站总试卷数量
  myQuestions: number; // 近一年我的题目上传数量
  myPapers: number; // 近一年我的试卷创建数量
}

export interface TeacherDashboardProps {
  /** 传入 React Router 的 navigate 函数即可自动处理跳转 */
  onNavigate?: (path: string) => void;
}

const TREND_DATA: MonthlyTrendPoint[] = [
  { month: '12月', siteQuestions: 4200, sitePapers: 310, myQuestions: 45, myPapers: 4 },
  { month: '1月', siteQuestions: 4650, sitePapers: 350, myQuestions: 62, myPapers: 6 },
  { month: '2月', siteQuestions: 4890, sitePapers: 365, myQuestions: 28, myPapers: 2 },
  { month: '3月', siteQuestions: 5420, sitePapers: 410, myQuestions: 85, myPapers: 8 },
  { month: '4月', siteQuestions: 6100, sitePapers: 468, myQuestions: 110, myPapers: 11 },
  { month: '5月', siteQuestions: 6850, sitePapers: 520, myQuestions: 96, myPapers: 9 },
  { month: '6月', siteQuestions: 7600, sitePapers: 590, myQuestions: 134, myPapers: 14 },
  { month: '7月', siteQuestions: 7920, sitePapers: 615, myQuestions: 40, myPapers: 3 },
  { month: '8月', siteQuestions: 8350, sitePapers: 645, myQuestions: 55, myPapers: 5 },
  { month: '9月', siteQuestions: 9180, sitePapers: 710, myQuestions: 128, myPapers: 12 },
  { month: '10月', siteQuestions: 10050, sitePapers: 785, myQuestions: 142, myPapers: 15 },
  { month: '11月', siteQuestions: 11240, sitePapers: 860, myQuestions: 165, myPapers: 16 },
];

const QUESTION_TYPE_STATS = [
  { name: '选择题', count: 520, percent: 48, color: 'bg-blue-500' },
  { name: '填空题', count: 310, percent: 28, color: 'bg-emerald-500' },
  { name: '解答/计算题', count: 190, percent: 18, color: 'bg-amber-500' },
  { name: '判断题/其他', count: 70, percent: 6, color: 'bg-purple-500' },
];

const CLASS_PERFORMANCE = [
  { id: 'c1', className: '初二(1)班', studentCount: 46, avgScore: 86.5, submitRate: 98 },
  { id: 'c2', className: '初二(2)班', studentCount: 45, avgScore: 82.0, submitRate: 95 },
  { id: 'c3', className: '初二(4)班', studentCount: 47, avgScore: 79.4, submitRate: 91 },
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
  data: MonthlyTrendPoint[];
  dataKey: keyof Omit<MonthlyTrendPoint, 'month'>;
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
// 4. 主工作台页面组件
// ==========================================
export default function TeacherDashboardPage({ onNavigate }: TeacherDashboardProps) {
  const handleJump = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      console.log('跳转到页面:', path);
    }
  };

  const stats = {
    pendingReviewQuestions: 14, // 待我审核题目
    pendingReviewPapers: 3, // 待我审核试卷
    pendingGradeCount: 28, // 待批改学生作答
    myQuestions: 1090, // 我的题目数量
    myQuestionUsedCount: 3420, // 我的题目被全站引用次数
    myPapers: 105, // 我的试卷数量
    assignedHomeworkCount: 68, // 布置作业次数
    myClassCount: 3, // 我的班级数量
    totalStudents: 138, // 班级学生总数
    classAvgScore: 82.6, // 班级平均分
    avgSubmitRate: 94.7, // 近30天作业平均提交率
  };

  return (
    <div className="p-3 space-y-3 bg-slate-50/50 min-h-screen">
      {/* 1. 顶部欢迎与快捷操作区 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">我的教学工作台</h1>
          <p className="text-sm text-slate-500 mt-1">查看题库沉淀、试卷资产、班级学情与待办审核任务</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" className="gap-1.5 bg-white" onClick={() => handleJump(DASHBOARD_ROUTES.createQuestion)}>
            <Plus className="w-4 h-4" />
            录入新题
          </Button>
          <Button variant="outline" className="gap-1.5 bg-white" onClick={() => handleJump(DASHBOARD_ROUTES.createPaper)}>
            <FileSpreadsheet className="w-4 h-4" />
            智能组卷
          </Button>
          <Button className="gap-1.5" onClick={() => handleJump(DASHBOARD_ROUTES.assignHomework)}>
            <Send className="w-4 h-4" />
            布置作业
          </Button>
        </div>
      </div>

      {/* 2. 待我处理/审核提醒条（全部支持点击跳转） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          onClick={() => handleJump(DASHBOARD_ROUTES.reviewQuestions)}
          className="border-amber-200/80 bg-amber-50/60 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-amber-300 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-800">待我审核的题目</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-amber-950">{stats.pendingReviewQuestions}</span>
                  <span className="text-xs text-amber-700">道待校对</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-amber-800 group-hover:bg-amber-100 gap-1">
              去审核 <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleJump(DASHBOARD_ROUTES.reviewPapers)}
          className="border-blue-200/80 bg-blue-50/60 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-blue-300 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-800">待我审核的试卷</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-blue-950">{stats.pendingReviewPapers}</span>
                  <span className="text-xs text-blue-700">份待终审</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-blue-800 group-hover:bg-blue-100 gap-1">
              去审核 <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleJump(DASHBOARD_ROUTES.gradeHomework)}
          className="border-purple-200/80 bg-purple-50/60 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-purple-300 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-800">待批改学生作答</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-purple-950">{stats.pendingGradeCount}</span>
                  <span className="text-xs text-purple-700">份含解答题</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-purple-800 group-hover:bg-purple-100 gap-1">
              去批阅 <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3. 我的核心资产与教学数据指标（全部带有“去查看”跳转入口） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 我的题目数量 */}
        <Card
          onClick={() => handleJump(DASHBOARD_ROUTES.myQuestions)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-blue-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">我的题目数量</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-blue-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FileQuestion className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.myQuestions.toLocaleString()}</span>
              <span className="text-xs text-slate-500">道原创/收录</span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                累计被全站组卷引用 <strong className="text-slate-700">{stats.myQuestionUsedCount}</strong> 次
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 我的试卷数量 */}
        <Card
          onClick={() => handleJump(DASHBOARD_ROUTES.myPapers)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-indigo-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">我的试卷数量</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.myPapers}</span>
              <span className="text-xs text-slate-500">套试卷/练习</span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500">
              本月新增 <strong className="text-indigo-600">+16</strong> 套 · 含同步练习与阶段测试
            </div>
          </CardContent>
        </Card>

        {/* 布置作业次数 */}
        <Card
          onClick={() => handleJump(DASHBOARD_ROUTES.homeworkHistory)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-emerald-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">累计布置作业</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Send className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stats.assignedHomeworkCount}</span>
              <span className="text-xs text-slate-500">次任务下发</span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500">
              近30天平均按时提交率 <strong className="text-emerald-600">{stats.avgSubmitRate}%</strong>
            </div>
          </CardContent>
        </Card>

        {/* 我的班级与学生数量 */}
        <Card
          onClick={() => handleJump(DASHBOARD_ROUTES.myClasses)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-cyan-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">我的班级与学生</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-cyan-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-4">
              <div>
                <span className="text-3xl font-bold text-slate-900">{stats.myClassCount}</span>
                <span className="text-xs text-slate-500 ml-1">个班级</span>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-3xl font-bold text-slate-900">{stats.totalStudents}</span>
                <span className="text-xs text-slate-500 ml-1">名学生</span>
              </div>
            </div>
            <div className="mt-2.5 text-xs text-slate-500">覆盖初二年级 3 个教学行政班</div>
          </CardContent>
        </Card>

        {/* 班级平均分 */}
        <Card
          onClick={() => handleJump(DASHBOARD_ROUTES.gradeAnalytics)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-amber-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">所教班级综合平均分</span>
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
              <span className="text-3xl font-bold text-slate-900">{stats.classAvgScore}</span>
              <span className="text-xs text-slate-500">分（百分制折算）</span>
            </div>
            <div className="mt-2.5 text-xs text-emerald-600 font-medium">较上月阶段测提升 +2.4 分 · 及格率 92.8%</div>
          </CardContent>
        </Card>

        {/* 错题订正完成率 */}
        <Card
          onClick={() => handleJump(DASHBOARD_ROUTES.mistakeAnalytics)}
          className="bg-white border-slate-200/90 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-rose-200 group"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">错题订正完成率</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-rose-600 flex items-center gap-0.5 group-hover:underline">
                  去查看 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">88.5%</span>
              <span className="text-xs text-slate-500">学生已重做错题</span>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>
                薄弱点：<strong className="text-slate-700">一次函数图像应用</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. 近一年 4 大趋势图全部同屏展示（2×2 网格） */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">近一年资源增长趋势</h2>
          <p className="text-xs text-slate-500">全站题目与试卷累计规模及个人每月上传/创建数量变化明细</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 图表 1：近一年网站总题目数量变化趋势 */}
          <NativeTrendChart
            title="近一年网站总题目数量变化"
            subtitle="全站累计可用试题库规模（单位：道）"
            data={TREND_DATA}
            dataKey="siteQuestions"
            unit="道"
            strokeColor="#2563eb"
            fillId="siteQuestionsGradient"
            badgeText="全站题库"
            badgeClass="bg-blue-50 text-blue-700"
          />

          {/* 图表 2：近一年网站总试卷数量变化趋势 */}
          <NativeTrendChart
            title="近一年网站总试卷数量变化"
            subtitle="全站累计组卷与共享试卷总量（单位：套）"
            data={TREND_DATA}
            dataKey="sitePapers"
            unit="套"
            strokeColor="#059669"
            fillId="sitePapersGradient"
            badgeText="全站试卷"
            badgeClass="bg-emerald-50 text-emerald-700"
          />

          {/* 图表 3：近一年我的题目上传数量趋势 */}
          <NativeTrendChart
            title="近一年我的题目上传趋势"
            subtitle="我每月录入与审核通过的题目数量（单位：道）"
            data={TREND_DATA}
            dataKey="myQuestions"
            unit="道"
            strokeColor="#7c3aed"
            fillId="myQuestionsGradient"
            badgeText="个人上传"
            badgeClass="bg-purple-50 text-purple-700"
          />

          {/* 图表 4：近一年我的试卷创建趋势 */}
          <NativeTrendChart
            title="近一年我的试卷创建趋势"
            subtitle="我每月新建的作业卷与测评卷数量（单位：套）"
            data={TREND_DATA}
            dataKey="myPapers"
            unit="套"
            strokeColor="#d97706"
            fillId="myPapersGradient"
            badgeText="个人组卷"
            badgeClass="bg-amber-50 text-amber-700"
          />
        </div>
      </div>

      {/* 5. 底部教学细化分析：各班级学情对比 + 我的题库题型构成 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧 2/3：各班级平均分与提交率对比 */}
        <Card className="lg:col-span-2 bg-white border-slate-200/90 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  各班级学情明细对比
                </CardTitle>
                <CardDescription className="text-xs mt-1">方便横向对比所带不同班级的作业完成度与平均分表现</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1" onClick={() => handleJump(DASHBOARD_ROUTES.gradeAnalytics)}>
                去查看完整成绩单 <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {CLASS_PERFORMANCE.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => handleJump(`${DASHBOARD_ROUTES.myClasses}/${cls.id}`)}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1 min-w-[140px]">
                    <div className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                      {cls.className}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="text-xs text-slate-500">班级人数：{cls.studentCount} 人</div>
                  </div>

                  <div className="flex-1 max-w-xs space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">作业平均提交率</span>
                      <span className="font-medium text-slate-700">{cls.submitRate}%</span>
                    </div>
                    <Progress value={cls.submitRate} className="h-1.5" />
                  </div>

                  <div className="text-left sm:text-right min-w-[100px]">
                    <div className="text-xs text-slate-400">班级平均分</div>
                    <div className="text-lg font-bold text-slate-900">
                      {cls.avgScore} <span className="text-xs font-normal text-slate-500">分</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 右侧 1/3：我的题库题型分布 */}
        <Card className="bg-white border-slate-200/90 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">我的题库结构分布</CardTitle>
              <CardDescription className="text-xs mt-1">共 {stats.myQuestions} 道题目的题型占比分析</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 h-7 px-2 gap-0.5"
              onClick={() => handleJump(DASHBOARD_ROUTES.myQuestions)}
            >
              去查看 <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-3 rounded-full overflow-hidden flex gap-0.5 bg-slate-100">
              {QUESTION_TYPE_STATS.map((item) => (
                <div
                  key={item.name}
                  style={{ width: `${item.percent}%` }}
                  className={`${item.color} h-full`}
                  title={`${item.name}: ${item.percent}%`}
                />
              ))}
            </div>

            <div className="space-y-3 pt-1">
              {QUESTION_TYPE_STATS.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="font-semibold text-slate-800">{item.count} 道</span>
                    <span className="text-xs text-slate-400 w-9 text-right">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
