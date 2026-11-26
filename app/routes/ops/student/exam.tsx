import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  Flag,
  HelpCircle,
  Image as ImageIcon,
  Lightbulb,
  ListOrdered,
  MessageCircleQuestion,
  Send,
  Sparkles,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

// ==========================================
// 1. 类型定义
// ==========================================
export type ExamMode = 'practice' | 'exam'; // practice: 练习模式(支持即时判题/看答案); exam: 测试模式(交卷后才显示结果)
export type QuestionType = 'single_choice' | 'fill_blank' | 'short_answer';

export interface ChoiceOption {
  key: string;
  text: string;
}

export interface QuestionHint {
  thinkingTips: string[]; // 思路点拨（默认折叠列表，点击逐项展开）
  stepByStep: string[]; // 步骤讲解（默认折叠列表，点击逐项展开）
  socraticQuestions: string[]; // 苏格拉底引导提问（启发式思考）
}

export interface QuestionItem {
  id: string;
  type: QuestionType;
  typeLabel: string;
  indexInType: number; // 题型内编号：如 1, 2, 3...
  score: number;
  stem: string; // 题干
  stemImage?: string; // 题干配图（可选）
  options?: ChoiceOption[]; // 选择题选项
  blankCount?: number; // 填空题空位数量
  correctAnswer: string | string[]; // 标准答案
  analysis: string; // 详细解析
  hints: QuestionHint; // 右侧启发与提示
}

export interface StudentAnswer {
  choice?: string; // 选择题答案
  blanks?: string[]; // 填空题答案数组
  text?: string; // 解答题文本
  images?: string[]; // 解答题/草稿拍照上传的图片预览URL
  isFlagged?: boolean; // 疑问标记
}

// ==========================================
// 2. 模拟试卷数据（涵盖选择题、填空题、解答题）
// ==========================================
const MOCK_PAPER = {
  title: '五年级数学上册《多边形的面积与小数应用》综合训练',
  durationSeconds: 45 * 60, // 45分钟倒计时
  questions: [
    // --- 选择题 (1-4) ---
    {
      id: 'q-choice-1',
      type: 'single_choice',
      typeLabel: '选择题',
      indexInType: 1,
      score: 5,
      stem: '一个平行四边形的底是 8 厘米，高是 5 厘米。如果把它的底和高同时扩大到原来的 2 倍，那么它的面积会扩大到原来的（   ）倍。',
      options: [
        { key: 'A', text: '2 倍' },
        { key: 'B', text: '4 倍' },
        { key: 'C', text: '6 倍' },
        { key: 'D', text: '8 倍' },
      ],
      correctAnswer: 'B',
      analysis:
        '平行四边形面积 = 底 × 高。原面积 = 8 × 5 = 40（平方厘米）；底和高都扩大 2 倍后，新面积 = (8×2) × (5×2) = 16 × 10 = 160（平方厘米）。160 ÷ 40 = 4 倍。',
      hints: {
        thinkingTips: ['回忆平行四边形的面积计算公式是什么？', '可以尝试用‘假设法’：先算出原来的具体面积，再算出变化后的面积进行对比。'],
        stepByStep: [
          '第一步：列出原面积公式 S = 底 × 高 = 8 × 5 = 40。',
          '第二步：计算扩大后的底（8×2=16）和高（5×2=10）。',
          '第三步：计算新面积 16 × 10 = 160，再用 160 ÷ 40 得出倍数。',
        ],
        socraticQuestions: ['如果只有‘底’扩大 2 倍，而‘高’保持不变，面积会变成原来的几倍呢？', '现在‘底’和‘高’两个因数都乘了 2，积一共乘了几个 2？'],
      },
    },
    {
      id: 'q-choice-2',
      type: 'single_choice',
      typeLabel: '选择题',
      indexInType: 2,
      score: 5,
      stem: '下面算式中，与 9.6 ÷ 0.24 的得数相等的是（   ）。',
      options: [
        { key: 'A', text: '96 ÷ 24' },
        { key: 'B', text: '960 ÷ 24' },
        { key: 'C', text: '0.96 ÷ 2.4' },
        { key: 'D', text: '960 ÷ 2.4' },
      ],
      correctAnswer: 'B',
      analysis:
        '根据商不变的性质：被除数和除数同时乘或除以相同的数（0除外），商不变。将 0.24 变成整数 24 需要向右移动两位小数点（乘 100），因此 9.6 也要乘 100 变成 960。',
      hints: {
        thinkingTips: ['复习除数是小数的除法法则：先把除数转化成整数。', '注意被除数和除数的小数点必须向右移动相同的位数。'],
        stepByStep: [
          '第一步：观察除数 0.24，要变成整数 24 需要乘以 100。',
          '第二步：为了保持商不变，被除数 9.6 也要乘以 100。',
          '第三步：9.6 小数点向右移动两位，位数不够用 0 补足，得到 960。',
        ],
        socraticQuestions: [
          '如果把 0.24 变成 24，它扩大了多少倍？',
          '在小数点向右移动两位时，9.6 后面只有一位小数，空出来的位置应该用什么数字占位？',
        ],
      },
    },
    {
      id: 'q-choice-3',
      type: 'single_choice',
      typeLabel: '选择题',
      indexInType: 3,
      score: 5,
      stem: '把一个长方形木框拉成一个平行四边形，它的周长和面积变化情况是（   ）。',
      options: [
        { key: 'A', text: '周长不变，面积变大' },
        { key: 'B', text: '周长不变，面积变小' },
        { key: 'C', text: '周长变小，面积不变' },
        { key: 'D', text: '周长和面积都不变' },
      ],
      correctAnswer: 'B',
      analysis: '木框的四条边长度没有发生任何改变，所以周长不变；在拉动过程中，平行四边形的底等于长方形的长，但高比长方形的宽变矮了，因此面积变小。',
      hints: {
        thinkingTips: ['周长看四条边的总长度有没有变；面积看‘底’和‘高’有没有变。', '闭上眼睛想象把一个长方形框往两边压扁的过程。'],
        stepByStep: [
          '第一步：判断周长——木条长度没变，所以四边总长（周长）不变。',
          '第二步：判断面积——底边长度没变，但图形变‘矮’了，说明高变短了。',
          '第三步：底不变、高变小，所以面积变小。',
        ],
        socraticQuestions: ['拉动木框时，四根木条本身变长或变短了吗？', '如果继续往下压，一直压成一条扁扁的直线，里面的空间（面积）会变成多少？'],
      },
    },
    {
      id: 'q-choice-4',
      type: 'single_choice',
      typeLabel: '选择题',
      indexInType: 4,
      score: 5,
      stem: '一个三角形的面积是 24 平方分米，底是 6 分米，它的高是（   ）分米。',
      options: [
        { key: 'A', text: '4' },
        { key: 'B', text: '8' },
        { key: 'C', text: '12' },
        { key: 'D', text: '144' },
      ],
      correctAnswer: 'B',
      analysis: '三角形面积 = 底 × 高 ÷ 2。已知面积和底求高时，需要先用面积乘 2，再除以底：24 × 2 ÷ 6 = 8（分米）。很多同学容易忘记乘 2！',
      hints: {
        thinkingTips: ['小心陷阱！三角形面积公式里有一个‘÷ 2’。', '两个完全一样的三角形才能拼成一个平行四边形。'],
        stepByStep: [
          '第一步：先把三角形面积乘 2，还原成等底等高的平行四边形面积：24 × 2 = 48。',
          '第二步：用平行四边形面积除以底，得到高：48 ÷ 6 = 8（分米）。',
        ],
        socraticQuestions: ['如果直接用 24 ÷ 6 = 4，算出来的其实是哪种图形的高？', '怎样把算出来的答案代回三角形面积公式里验证一下？'],
      },
    },

    // --- 填空题 (1-3) ---
    {
      id: 'q-blank-1',
      type: 'fill_blank',
      typeLabel: '填空题',
      indexInType: 1,
      score: 6,
      stem: '3.25 小时 = （  ①  ）小时（  ②  ）分；  4500 平方米 = （  ③  ）公顷。',
      blankCount: 3,
      correctAnswer: ['3', '15', '0.45'],
      analysis: '① 整数部分 3 就是 3 小时；② 0.25 小时 = 0.25 × 60 = 15 分钟；③ 1 公顷 = 10000 平方米，4500 ÷ 10000 = 0.45 公顷。',
      hints: {
        thinkingTips: ['时间单位换算进率是 60，不是 100！', '面积单位中，平方米和公顷之间的进率是 10000。'],
        stepByStep: [
          '第一空：3.25 的整数部分直接填入 3。',
          '第二空：把小数部分 0.25 乘以进率 60，得到 15 分。',
          '第三空：低级单位化高级单位除以进率，4500 ÷ 10000 小数点向左移动四位。',
        ],
        socraticQuestions: ['0.25 小时是不是 25 分钟？为什么？', '1 公顷等于多少平方米？4500 平方米够不够 1 公顷？'],
      },
    },
    {
      id: 'q-blank-2',
      type: 'fill_blank',
      typeLabel: '填空题',
      indexInType: 2,
      score: 4,
      stem: '一个两位小数‘四舍五入’保留一位小数后是 6.0，这个两位小数最大是（  ①  ），最小是（  ②  ）。',
      blankCount: 2,
      correctAnswer: ['6.04', '5.95'],
      analysis:
        '‘四舍’得到 6.0 说明原数比 6.0 大，百分位最大只能是 4，即 6.04；‘五入’得到 6.0 说明原数比 6.0 小，整数和十分位是 5.9，百分位最小是 5，即 5.95。',
      hints: {
        thinkingTips: ['记住口诀：‘四舍’找最大，‘五入’找最小。', '保留一位小数，只需要看百分位（小数点后第二位）上的数字。'],
        stepByStep: [
          '第一步（求最大）：从‘四舍’入手，前面保持 6.0 不变，百分位最大填 4，得 6.04。',
          '第二步（求最小）：从‘五入’入手，前面退一位变成 5.9，百分位最小填 5 才能进位成 6.0，得 5.95。',
        ],
        socraticQuestions: [
          '6.09 保留一位小数会变成多少？所以最大能填 6.09 吗？',
          '比 6.0 小且最接近 6.0 的一位小数是多少？它的百分位填几才能进 1？',
        ],
      },
    },
    {
      id: 'q-blank-3',
      type: 'fill_blank',
      typeLabel: '填空题',
      indexInType: 3,
      score: 4,
      stem: '一个梯形的上底是 4 厘米，下底是 6 厘米，高是 5 厘米，它的面积是（  ①  ）平方厘米。',
      blankCount: 1,
      correctAnswer: ['25'],
      analysis: '梯形面积 = (上底 + 下底) × 高 ÷ 2 = (4 + 6) × 5 ÷ 2 = 10 × 5 ÷ 2 = 25（平方厘米）。',
      hints: {
        thinkingTips: ['回忆梯形面积公式，不要忘记最后要除以 2。', '先算上底加下底的和，凑成整十数计算更简便。'],
        stepByStep: [
          '第一步：计算上底与下底的和：4 + 6 = 10（厘米）。',
          '第二步：用和乘以高：10 × 5 = 50。',
          '第三步：除以 2 得到面积：50 ÷ 2 = 25（平方厘米）。',
        ],
        socraticQuestions: ['为什么梯形面积公式里也要‘除以 2’？', '如果把这个梯形的上底缩短成 0 厘米，它会变成什么图形？公式还适用吗？'],
      },
    },

    // --- 解答题 (1-2) ---
    {
      id: 'q-short-1',
      type: 'short_answer',
      typeLabel: '解答题',
      indexInType: 1,
      score: 12,
      stem: `一块梯形麦田，上底是 120 米，下底是 180 米，高是 80 米。如果每公顷收小麦 6.5 吨，这块麦田一共可以收小麦多少吨？（请写出完整计算过程，支持拍照上传手写步骤）",
      correctAnswer:
        "1. 麦田面积：(120 + 180) × 80 ÷ 2 = 300 × 80 ÷ 2 = 12000（平方米）
2. 单位换算：12000 平方米 = 1.2 公顷
3. 总产量：1.2 × 6.5 = 7.8（吨）
答：这块麦田一共可以收小麦 7.8 吨。`,
      analysis:
        '本题分为三步：先求梯形面积（单位是平方米），再把平方米换算成公顷（除以 10000），最后用公顷数乘每公顷产量 6.5 吨。最常见的错误是忘记换算单位直接用 12000 乘 6.5。',
      hints: {
        thinkingTips: ['圈出题目中的关键词：‘梯形’、‘每公顷’、单位分别是‘米’和‘公顷’！', '单位不统一时，一定要先换算单位再算产量。'],
        stepByStep: [
          '第一步：套用梯形面积公式算出麦田有多少平方米。',
          '第二步：将算出的平方米数除以 10000，换算成‘公顷’。',
          '第三步：用公顷数 × 6.5 吨，写出答句。',
        ],
        socraticQuestions: [
          '题目给出的长和宽单位是‘米’，而后面产量给的是‘每公顷’，直接相乘会发生什么？',
          '12000 平方米换算成公顷，小数点应该向哪个方向移动几位？',
        ],
      },
    },
    {
      id: 'q-short-2',
      type: 'short_answer',
      typeLabel: '解答题',
      indexInType: 2,
      score: 14,
      stem: '某市出租车收费标准如下：3 千米以内（含 3 千米）收费 10 元；超过 3 千米的部分，每千米收费 2.4 元（不足 1 千米按 1 千米计算）。小明乘出租车去博物馆，行驶了 7.3 千米，他一共需要付车费多少元？',
      correctAnswer: `1. 里程进一取整：7.3 千米按 8 千米计算
2. 超出里程：8 - 3 = 5（千米）
3. 超出部分费用：5 × 2.4 = 12（元）
4. 总费用：10 + 12 = 22（元）
答：他一共需要付车费 22 元。`,
      analysis:
        '分段计费问题：首先根据‘不足 1 千米按 1 千米计算’（进一法），7.3 千米要按 8 千米算；然后把 8 千米分成基础 3 千米（10元）和超出 5 千米（5 × 2.4 = 12元）两部分相加。',
      hints: {
        thinkingTips: ['这是典型的‘分段计费’问题，建议画一条线段分成两段来理解。', '注意括号里的规则：‘不足 1 千米按 1 千米计算’要用进一法。'],
        stepByStep: [
          '第一步：处理小数里程——7.3 千米超过 7 千米了，按 8 千米计算。',
          '第二步：分段计算——前 3 千米固定 10 元；剩下 8 - 3 = 5 千米按每千米 2.4 元计算。',
          '第三步：把两段的钱加起来：10 + 12 = 22 元。',
        ],
        socraticQuestions: [
          '7.3 千米中的 0.3 千米虽然不到 1 千米，按照出租车规则要怎么算钱？',
          '是不是 8 千米全部都按 2.4 元/千米来计算？前 3 千米应该怎么算？',
        ],
      },
    },
  ] as QuestionItem[],
};

// ==========================================
// 3. 辅助工具函数
// ==========================================
function formatSeconds(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function checkIsAnswered(q: QuestionItem, ans?: StudentAnswer): boolean {
  if (!ans) return false;
  if (q.type === 'single_choice') return Boolean(ans.choice);
  if (q.type === 'fill_blank') {
    return Boolean(ans.blanks && ans.blanks.some((b) => b.trim() !== ''));
  }
  if (q.type === 'short_answer') {
    return Boolean((ans.text && ans.text.trim() !== '') || (ans.images && ans.images.length > 0));
  }
  return false;
}

function checkIsCorrect(q: QuestionItem, ans?: StudentAnswer): boolean | null {
  if (!ans) return false;
  if (q.type === 'single_choice') {
    if (!ans.choice) return false;
    return ans.choice === q.correctAnswer;
  }
  if (q.type === 'fill_blank' && Array.isArray(q.correctAnswer)) {
    if (!ans.blanks) return false;
    return q.correctAnswer.every((std, idx) => (ans.blanks?.[idx] || '').trim() === std.trim());
  }
  // 解答题通常需要主观批改，返回 null 表示待批改/参考对照
  return null;
}

// ==========================================
// 4. 主组件：三栏式学生在线作答工作台
// ==========================================
export default function ExamInfo() {
  // 全局模式控制：'practice' (练习模式：支持实时对错反馈和查看答案) | 'exam' (测试模式：交卷后才解锁答案)
  const [mode, setMode] = useState<ExamMode>('practice');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // 当前选中的题目 ID
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(MOCK_PAPER.questions[0].id);

  // 学生作答记录字典
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});

  // 当前题目是否展开查看答案（练习模式下可手动切换，交卷后自动展示）
  const [revealedAnswerMap, setRevealedAnswerMap] = useState<Record<string, boolean>>({});

  // 右侧提示面板的折叠状态控制（默认全部收起，点击列表具体项展开）
  const [openThinkingItems, setOpenThinkingItems] = useState<Record<string, boolean>>({});
  const [openStepItems, setOpenStepItems] = useState<Record<string, boolean>>({});
  const [openSocraticItems, setOpenSocraticItems] = useState<Record<string, boolean>>({});

  // 倒计时状态（前端控制）
  const [timeLeft, setTimeLeft] = useState<number>(MOCK_PAPER.durationSeconds);

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  // 按题型分组题目（用于左侧答题卡分块渲染）
  const groupedQuestions = useMemo(() => {
    const groups: {
      type: QuestionType;
      typeLabel: string;
      items: QuestionItem[];
    }[] = [];

    MOCK_PAPER.questions.forEach((q) => {
      let group = groups.find((g) => g.type === q.type);
      if (!group) {
        group = { type: q.type, typeLabel: q.typeLabel, items: [] };
        groups.push(group);
      }
      group.items.push(q);
    });
    return groups;
  }, []);

  const currentIndex = MOCK_PAPER.questions.findIndex((q) => q.id === currentQuestionId);
  const currentQuestion = MOCK_PAPER.questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id] || {};

  // 是否允许当前题目显示标准答案与正误对比
  const canShowFeedback = isSubmitted || (mode === 'practice' && Boolean(revealedAnswerMap[currentQuestion.id]));

  // 统计已答题目数
  const answeredTotal = useMemo(() => {
    return MOCK_PAPER.questions.filter((q) => checkIsAnswered(q, answers[q.id])).length;
  }, [answers]);

  // 更新作答数据
  const updateAnswer = (qId: string, patch: Partial<StudentAnswer>) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], ...patch },
    }));
  };

  // 选择题点击选项
  const handleSelectChoice = (optionKey: string) => {
    if (isSubmitted) return;
    updateAnswer(currentQuestion.id, { choice: optionKey });
    // 练习模式下，选择后自动触发即时判题反馈（也可改成手动点查看答案，这里两者兼顾）
    if (mode === 'practice') {
      setRevealedAnswerMap((prev) => ({ ...prev, [currentQuestion.id]: true }));
    }
  };

  // 填空题输入
  const handleBlankChange = (blankIndex: number, value: string) => {
    if (isSubmitted) return;
    const count = currentQuestion.blankCount || 1;
    const nextBlanks = Array.from({ length: count }, (_, i) => currentAnswer.blanks?.[i] || '');
    nextBlanks[blankIndex] = value;
    updateAnswer(currentQuestion.id, { blanks: nextBlanks });
  };

  // 拍照/图片上传处理（本地生成预览图）
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitted || !e.target.files) return;
    const files = Array.from(e.target.files);
    const newUrls = files.map((file) => URL.createObjectURL(file));
    const existing = currentAnswer.images || [];
    updateAnswer(currentQuestion.id, { images: [...existing, ...newUrls] });
    e.target.value = '';
  };

  const handleRemoveImage = (imgIdx: number) => {
    if (isSubmitted) return;
    const existing = currentAnswer.images || [];
    updateAnswer(currentQuestion.id, {
      images: existing.filter((_, idx) => idx !== imgIdx),
    });
  };

  // 切换右侧提示某一条的展开/收起
  const toggleHintItem = (setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, key: string) => {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 交卷操作
  const handleSubmitPaper = () => {
    setIsSubmitted(true);
  };

  // 切换模式（用于演示练习模式 vs 测试模式的区别）
  const handleSwitchMode = (newMode: ExamMode) => {
    setMode(newMode);
    setIsSubmitted(false);
    setRevealedAnswerMap({});
  };

  // 头部概览
  const topContent = (
    <header className="bg-card p-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
      <div className="flex items-center gap-2.5">
        <Badge className="bg-indigo-600 text-white hover:bg-indigo-600">在线作答台</Badge>
        <span className="text-sm font-medium text-slate-600 hidden sm:inline">当前作答策略：</span>
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => handleSwitchMode('practice')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'practice' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            练习模式（即时对错/看答案）
          </button>
          <button
            onClick={() => handleSwitchMode('exam')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'exam' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            测试模式（交卷后出结果）
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isSubmitted ? (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">已交卷 · 可查看全卷解析</Badge>
        ) : (
          <Button size="sm" onClick={handleSubmitPaper} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
            <Send className="w-3.5 h-3.5" />
            提交试卷 ({answeredTotal}/{MOCK_PAPER.questions.length})
          </Button>
        )}
      </div>
    </header>
  );

  // 左边答题卡区域
  const leftContent = (
    <Card className="overflow-hidden flex flex-col p-0">
      {/* 答题卡顶部：试卷标题、总题数、倒计时 */}
      <div className="p-3 space-y-3">
        <div>
          <h2 className="text-slate-800 text-sm font-semibold leading-snug">{MOCK_PAPER.title}</h2>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
            <span>共 {MOCK_PAPER.questions.length} 题</span>
            <span>
              已答 <strong className="text-indigo-600">{answeredTotal}</strong> / {MOCK_PAPER.questions.length}
            </span>
          </div>
        </div>

        {/* 倒计时胶囊 */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-mono ${
            timeLeft < 300 && !isSubmitted ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <span className="flex items-center gap-1.5 text-xs font-sans font-medium">
            <Clock className="w-4 h-4 text-indigo-500" />
            {isSubmitted ? '作答已结束' : '剩余时间'}
          </span>
          <span className="font-bold tracking-wider">{formatSeconds(timeLeft)}</span>
        </div>
      </div>

      {/* 答题卡题目网格：按题型分块显示 */}
      <ScrollArea>
        <div className="space-y-3 p-3">
          {groupedQuestions.map((group) => (
            <div key={group.type} className="space-y-2.5">
              {/* 题型标题 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 inline-block" />
                  {group.typeLabel}
                </span>
                <span className="text-xs text-slate-400">共 {group.items.length} 题</span>
              </div>

              {/* 题号按钮网格（题型内独立编号 1, 2, 3...） */}
              <div className="flex gap-2">
                {group.items.map((q) => {
                  const isCurrent = q.id === currentQuestion.id;
                  const ans = answers[q.id];
                  const answered = checkIsAnswered(q, ans);
                  const isFlagged = ans?.isFlagged;

                  // 判断是否需要展示正误颜色（练习模式已看答案 或 已交卷）
                  const showResultColor = isSubmitted || (mode === 'practice' && revealedAnswerMap[q.id]);
                  const isCorrect = showResultColor ? checkIsCorrect(q, ans) : null;

                  let btnStyle = 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300';

                  if (showResultColor && isCorrect === true) {
                    btnStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
                  } else if (showResultColor && isCorrect === false) {
                    btnStyle = 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
                  } else if (answered) {
                    btnStyle = 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold';
                  }

                  if (isCurrent) {
                    btnStyle += ' ring-2 ring-indigo-600 ring-offset-1';
                  }

                  return (
                    <Button
                      key={q.id}
                      onClick={() => setCurrentQuestionId(q.id)}
                      className={`relative h-9 w-12 rounded-lg border text-xs transition-all flex items-center justify-center ${btnStyle}`}
                    >
                      {q.indexInType}
                      {/* 疑问小旗标 */}
                      {isFlagged && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 底部图例说明 */}
      <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <i className="w-3.5 h-3.5 rounded-xs bg-indigo-100 border border-indigo-300 inline-block" />
          已答
        </span>
        <span className="flex items-center gap-1">
          <i className="w-3.5 h-3.5 rounded-xs bg-slate-100 border border-slate-200 inline-block" />
          未答
        </span>
        <span className="flex items-center gap-1">
          <i className="w-3.5 h-3.5 rounded-xs bg-emerald-100 border border-emerald-300 inline-block" />
          正确
        </span>
        <span className="flex items-center gap-1">
          <i className="w-3.5 h-3.5 rounded-xs bg-rose-100 border border-rose-300 inline-block" />
          错误
        </span>
      </div>
    </Card>
  );

  // 中间题目区域
  const middleContent = (
    <Card className="space-y-3 p-3">
      {/* 顶部题目标题栏 */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold px-2.5 py-0.5">
            {currentQuestion.typeLabel} · 第 {currentQuestion.indexInType} 题
          </Badge>
          <span className="text-xs text-slate-400">（本题 {currentQuestion.score} 分）</span>
        </div>

        {/* 标记疑问按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            updateAnswer(currentQuestion.id, {
              isFlagged: !currentAnswer.isFlagged,
            })
          }
          className={`h-8 text-xs gap-1.5 ${
            currentAnswer.isFlagged ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flag className="w-3.5 h-3.5 fill-current" />
          {currentAnswer.isFlagged ? '已标疑问' : '标记疑问'}
        </Button>
      </div>

      {/* 题干内容 */}
      <div className="text-base sm:text-[17px] text-slate-800 leading-relaxed font-medium">{currentQuestion.stem}</div>

      {/* A. 选择题作答区 */}
      {currentQuestion.type === 'single_choice' && currentQuestion.options && (
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentAnswer.choice === opt.key;
            const isRightOption = opt.key === currentQuestion.correctAnswer;

            // 计算选项对比样式
            let optionStyle = 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/70';
            let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

            if (canShowFeedback) {
              // 揭示答案/交卷后的对错对比色
              if (isRightOption) {
                optionStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-950';
                badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
              } else if (isSelected && !isRightOption) {
                optionStyle = 'border-rose-500 bg-rose-50/80 text-rose-950';
                badgeStyle = 'bg-rose-600 text-white border-rose-600';
              } else {
                optionStyle = 'border-slate-200 bg-slate-50/40 opacity-75';
              }
            } else if (isSelected) {
              // 纯选中状态（测试模式未交卷）
              optionStyle = 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-xs';
              badgeStyle = 'bg-indigo-600 text-white border-indigo-600';
            }

            return (
              <button
                key={opt.key}
                type="button"
                disabled={isSubmitted}
                onClick={() => handleSelectChoice(opt.key)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${optionStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${badgeStyle}`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-sm sm:text-base font-medium">{opt.text}</span>
                </div>

                {/* 对错状态图标 */}
                {canShowFeedback && isRightOption && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                    正确答案
                  </span>
                )}
                {canShowFeedback && isSelected && !isRightOption && (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-600 shrink-0">
                    <XCircle className="w-5 h-5" />
                    你的选择
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* B. 填空题作答区 */}
      {currentQuestion.type === 'fill_blank' && (
        <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="text-xs font-semibold text-slate-500 mb-2">请在下方对应空格填写你的答案：</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: currentQuestion.blankCount || 1 }).map((_, idx) => {
              const val = currentAnswer.blanks?.[idx] || '';
              const stdAns = Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer[idx] : '';
              const isBlankCorrect = canShowFeedback && val.trim() === stdAns.trim();
              const isBlankWrong = canShowFeedback && val.trim() !== stdAns.trim();

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <Input
                      disabled={isSubmitted}
                      value={val}
                      onChange={(e) => handleBlankChange(idx, e.target.value)}
                      placeholder={`请输入第 ${idx + 1} 空答案`}
                      className={`bg-white ${
                        isBlankCorrect ? 'border-emerald-500 bg-emerald-50/40' : isBlankWrong ? 'border-rose-500 bg-rose-50/40' : ''
                      }`}
                    />
                  </div>
                  {canShowFeedback && (
                    <div className="pl-8 text-xs">
                      {isBlankCorrect ? (
                        <span className="text-emerald-600 font-medium">✓ 回答正确</span>
                      ) : (
                        <span className="text-rose-600 font-medium">✗ 标准答案：{stdAns}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* C. 解答题作答区（文本输入 + 拍照上传手写过程） */}
      {currentQuestion.type === 'short_answer' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
              <span>文字作答区（写明算式与答句）：</span>
              <span className="text-slate-400 font-normal">不方便打字？可在草稿纸书写后拍照上传</span>
            </label>
            <Textarea
              disabled={isSubmitted}
              rows={5}
              value={currentAnswer.text || ''}
              onChange={(e) => updateAnswer(currentQuestion.id, { text: e.target.value })}
              placeholder="请在此输入解题过程，例如：&#10;第一步：...&#10;第二步：...&#10;答：..."
              className="bg-slate-50/50 focus:bg-white text-sm leading-relaxed"
            />
          </div>

          {/* 拍照/图片上传区（适合中小学数学/物理手写步骤上传） */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold">拍照上传手写答题过程</span>
                <span className="text-slate-400">（支持 JPG/PNG，最多 3 张）</span>
              </div>

              {!isSubmitted && (
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-xs font-medium text-slate-700 shadow-2xs transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    选择图片 / 拍照上传
                  </span>
                </label>
              )}
            </div>

            {/* 已上传图片预览网格 */}
            {currentAnswer.images && currentAnswer.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {currentAnswer.images.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white aspect-4/3">
                    <img src={url} alt={`作答照片 ${idx + 1}`} className="w-full h-full object-cover" />
                    {!isSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                        title="删除图片"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-xs text-slate-400">暂无上传的手写图片，点击右上角按钮可上传作业本照片</div>
            )}
          </div>
        </div>
      )}

      {/* 练习模式专属：查看/收起答案按钮 */}
      {mode === 'practice' && !isSubmitted && (
        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setRevealedAnswerMap((prev) => ({
                ...prev,
                [currentQuestion.id]: !prev[currentQuestion.id],
              }))
            }
            className="gap-1.5 text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70"
          >
            {revealedAnswerMap[currentQuestion.id] ? (
              <>
                <EyeOff className="w-4 h-4" />
                隐藏参考答案与解析
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                查看答案与解析
              </>
            )}
          </Button>
        </div>
      )}

      {/* 测试模式未交卷提示 */}
      {mode === 'exam' && !isSubmitted && (
        <div className="text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          当前处于【测试模式】，提交整份试卷后将统一展示正误对比与详细解析。
        </div>
      )}

      {/* 答案与详细解析展示卡片 */}
      {canShowFeedback && (
        <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            参考答案与名师解析
          </div>
          <div className="text-sm text-emerald-950 font-semibold whitespace-pre-line bg-white/80 p-3 rounded-lg border border-emerald-100">
            标准答案：
            {Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(' ； ') : currentQuestion.correctAnswer}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900">解析：</strong>
            {currentQuestion.analysis}
          </p>
        </div>
      )}

      {/* 底部上一题 / 下一题导航 */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentQuestionId(MOCK_PAPER.questions[currentIndex - 1].id)}
          className="gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </Button>

        <span className="text-xs text-slate-400">
          第 {currentIndex + 1} / {MOCK_PAPER.questions.length} 题
        </span>

        {currentIndex < MOCK_PAPER.questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestionId(MOCK_PAPER.questions[currentIndex + 1].id)}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button disabled={isSubmitted} onClick={handleSubmitPaper} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Send className="w-4 h-4" />
            {isSubmitted ? '已交卷' : '完成并交卷'}
          </Button>
        )}
      </div>
    </Card>
  );

  // 左边扩展区域
  const rightContent = (
    <Card className="p-0">
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50/70 to-amber-50/60 border-b border-slate-200/80 p-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          AI 助学锦囊 · 渐进式引导
        </div>
        <p className="text-[11px] text-slate-500 mt-1">卡壳时逐条点击展开，像老师一样一步步启发思考</p>
      </div>

      <ScrollArea>
        <div className="space-y-3 p-3">
          {/* 模块 1：思路点拨（逐条点击展开） */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              思路点拨（点击锦囊展开）
            </div>
            <div className="space-y-2">
              {currentQuestion.hints.thinkingTips.map((tip, idx) => {
                const key = `${currentQuestion.id}-tip-${idx}`;
                const isOpen = Boolean(openThinkingItems[key]);
                return (
                  <div key={key} className="rounded-lg border border-amber-200/80 bg-amber-50/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleHintItem(setOpenThinkingItems, key)}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-amber-900 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
                    >
                      <span>💡 提示锦囊 #{idx + 1}</span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-600" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-2.5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-amber-100 bg-white">{tip}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 模块 2：步骤讲解（默认全部折叠，点击具体步骤展开） */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
              <ListOrdered className="w-4 h-4 text-blue-500" />
              分步拆解（按步骤查看）
            </div>
            <div className="space-y-2">
              {currentQuestion.hints.stepByStep.map((step, idx) => {
                const key = `${currentQuestion.id}-step-${idx}`;
                const isOpen = Boolean(openStepItems[key]);
                return (
                  <div key={key} className="rounded-lg border border-blue-200/80 bg-blue-50/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleHintItem(setOpenStepItems, key)}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-blue-900 flex items-center justify-between hover:bg-blue-100/50 transition-colors"
                    >
                      <span>第 {idx + 1} 步拆解</span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-2.5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-blue-100 bg-white">{step}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 模块 3：苏格拉底启发式提问 */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
              <MessageCircleQuestion className="w-4 h-4 text-purple-500" />
              苏格拉底反问（自我检验）
            </div>
            <div className="space-y-2">
              {currentQuestion.hints.socraticQuestions.map((qText, idx) => {
                const key = `${currentQuestion.id}-soc-${idx}`;
                const isOpen = Boolean(openSocraticItems[key]);
                return (
                  <div key={key} className="rounded-lg border border-purple-200/80 bg-purple-50/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleHintItem(setOpenSocraticItems, key)}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-purple-900 flex items-center justify-between hover:bg-purple-100/50 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        思考追问 #{idx + 1}
                      </span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-purple-600" /> : <ChevronDown className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-2.5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-purple-100 bg-white">“{qText}”</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );

  // 移动端
  if (useIsMobile()) {
    return (
      <div className="space-y-3">
        {topContent}
        {leftContent}
        {middleContent}
        {rightContent}
      </div>
    );
  }

  // PC 端
  return (
    <div className="space-y-3">
      {topContent}

      <ResizablePanelGroup orientation="horizontal" className="border flex-col! md:flex-row!">
        <ResizablePanel defaultSize="30%">
          <div className="pr-1.5">{leftContent}</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="40%">
          <div className="pl-1.5 pr-1.5">{middleContent}</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="30%">
          <div className="pl-1.5">{rightContent}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
