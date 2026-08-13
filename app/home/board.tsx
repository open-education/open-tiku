import { BookOpen, Clock, GraduationCap, TrendingUp, Upload } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

/// 统计面板
/// 统计面板的数据需要延后生成, 避免每次都重复计算且可能拖慢网站速度

function Board() {
  const LATEST_QUESTIONS = [
    { title: "已知 a²+b²=1，求 (a+b)² 的最大值", grade: "初三", edition: "人教版", time: "3分钟前" },
    { title: "设 f(x)=2x²−4x+m，若 f(x)=0 有两不等实根，求 m 的范围", grade: "高一", edition: "人教A版", time: "11分钟前" },
    { title: "列代数式：比 a 大 5 的数的平方", grade: "七年级", edition: "湘教版", time: "28分钟前" },
    { title: "△ABC 中，∠C=90°，AC=3，BC=4，求 sin A", grade: "初三", edition: "北师大版", time: "41分钟前" },
    { title: "一次函数 y=kx+b 过点 (1,3) 和 (−1,−1)，求 k、b", grade: "八年级", edition: "人教版", time: "1小时前" },
    { title: "分解因式：x²−9", grade: "八年级", edition: "湘教版", time: "1小时前" },
    { title: "等比数列首项为2，公比为3，求前5项之和", grade: "高二", edition: "人教A版", time: "2小时前" },
    { title: "用科学计数法表示 0.00000285", grade: "七年级", edition: "人教版", time: "2小时前" },
  ];

  const TOP_QUESTIONS = [
    { title: "一元二次方程求根公式应用综合题", grade: "初三", edition: "人教版", count: 8420 },
    { title: "直角三角形三角函数基础计算", grade: "初三", edition: "人教版", count: 7350 },
    { title: "整式加减运算（合并同类项）", grade: "七年级", edition: "人教版", count: 6890 },
    { title: "二次函数图象与性质综合", grade: "初三", edition: "人教版", count: 6210 },
    { title: "用字母表示数（列代数式）", grade: "七年级", edition: "湘教版", count: 5980 },
  ];

  const TOP_TEXTBOOKS = [
    { name: "人教版 初中数学 九年级上册", questions: 2840, schools: 342 },
    { name: "人教版 初中数学 八年级上册", questions: 2650, schools: 318 },
    { name: "湘教版 初中数学 七年级上册", questions: 2240, schools: 289 },
    { name: "人教A版 高中数学 必修一", questions: 2180, schools: 265 },
    { name: "人教版 初中数学 七年级上册", questions: 2050, schools: 247 },
    { name: "北师大版 初中数学 九年级上册", questions: 1920, schools: 221 },
    { name: "苏教版 小学数学 六年级上册", questions: 1780, schools: 198 },
    { name: "人教版 初中数学 八年级下册", questions: 1640, schools: 184 },
  ];

  const TOP_TEACHERS = [
    { name: "张**老师", school: "长沙市第一中学", count: 328 },
    { name: "李**老师", school: "湖南省实验中学", count: 286 },
    { name: "王**老师", school: "北京市第八十中学", count: 254 },
    { name: "陈**老师", school: "广州市执信中学", count: 218 },
  ];

  const TOP_STUDENTS = [
    { name: "王**同学", school: "湖南省实验中学", count: 1240 },
    { name: "李**同学", school: "长沙市雅礼中学", count: 1182 },
    { name: "张**同学", school: "北京市第四中学", count: 1056 },
    { name: "陈**同学", school: "广州市第二中学", count: 987 },
    { name: "刘**同学", school: "南京市金陵中学", count: 943 },
    { name: "赵**同学", school: "武汉外国语学校", count: 912 },
    { name: "孙**同学", school: "成都市第七中学", count: 876 },
    { name: "周**同学", school: "杭州市第二中学", count: 845 },
  ];

  function RankBadge({ n }: { n: number }) {
    return <Badge className="w-6 h-6 rounded flex items-center justify-center p-0 shrink-0">{n}</Badge>;
  }

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 最新上传 */}
        <div className="bg-white border">
          <div className="px-4 h-12 border-b flex items-center gap-2 text-sm font-bold">
            <TrendingUp size={16} />
            热门题目
          </div>
          <div>
            {LATEST_QUESTIONS.map((q, i) => (
              <a key={i} href="#" className={cn("flex items-center gap-4 px-4 py-2 hover:bg-muted/30 transition-colors group", i > 0 && "border-t")}>
                <RankBadge n={i + 1} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate group-hover:text-primary">{q.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.grade} · {q.edition}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{q.time}</span>
              </a>
            ))}
          </div>
        </div>

        {/* 热门题目 */}
        <div className="bg-white">
          <div className="px-4 h-12 border-b flex items-center gap-2 text-sm font-bold">
            <TrendingUp size={16} />
            热门题目
          </div>
          <div>
            {TOP_QUESTIONS.map((q, i) => (
              <a key={i} href="#" className={cn("flex items-center gap-4 px-4 py-2 hover:bg-muted/30 transition-colors group", i > 0 && "border-t")}>
                <RankBadge n={i + 1} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate group-hover:text-primary">{q.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.grade} · {q.edition}
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0">{q.count.toLocaleString()} 次</span>
              </a>
            ))}
          </div>
        </div>

        {/* 热门教材 */}
        <div className="bg-white">
          <div className="px-4 h-12 border-b flex items-center gap-2 text-sm font-bold">
            <BookOpen size={16} />
            热门教材
          </div>
          <div>
            {TOP_TEXTBOOKS.map((t, i) => (
              <div key={i} className={cn("flex items-center gap-4 px-4 py-2 hover:bg-muted/30 transition-colors", i > 0 && "border-t")}>
                <RankBadge n={i + 1} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.schools} 所学校在用</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0">{t.questions.toLocaleString()} 题</span>
              </div>
            ))}
          </div>
        </div>

        {/* 活跃教师 */}
        <div className="bg-white">
          <div className="px-4 h-12 border-b flex items-center gap-2 text-sm font-bold">
            <Upload size={16} />
            活跃教师
          </div>
          <div>
            {TOP_TEACHERS.map((t, i) => (
              <div key={i} className={cn("flex items-center gap-4 px-4 py-2 hover:bg-muted/30 transition-colors", i > 0 && "border-t")}>
                <RankBadge n={i + 1} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.school}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0">上传 {t.count} 题</span>
              </div>
            ))}
          </div>
        </div>

        {/* 活跃学生 */}
        <div className="bg-white">
          <div className="px-4 h-12 border-b flex items-center gap-2 text-sm font-bold">
            <GraduationCap size={16} />
            活跃学生
          </div>
          <div>
            {TOP_STUDENTS.map((s, i) => (
              <div key={i} className={cn("flex items-center gap-4 px-4 py-2 hover:bg-muted/30 transition-colors", i > 0 && "border-t")}>
                <RankBadge n={i + 1} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.school}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0">做题 {s.count.toLocaleString()} 题</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { Board };
