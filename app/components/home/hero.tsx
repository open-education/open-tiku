import { Badge } from '@/components/ui/badge';
import type { CountInfo } from '@/type/bord';
import { formatNumber } from '@/util/fmt';
import { cn } from 'cn';

// 总数统计
interface CountStatProps {
  id: number;
  count: string;
  className: string;
  title: string;
}

interface HeroProps {
  countInfo: CountInfo;
}

export default function Hero({
  countInfo = {
    textbookNum: 0,
    questionNum: 0,
    paperNum: 0,
    teacherNum: 0,
    studentNum: 0,
  },
}: HeroProps) {
  // 生成统计信息
  const stats: CountStatProps[] = [
    {
      id: 1,
      count: formatNumber(countInfo.textbookNum),
      className: 'text-orange-600',
      title: '本教材',
    },
    {
      id: 2,
      count: formatNumber(countInfo.questionNum),
      className: 'text-green-600',
      title: '道优质题目',
    },
    {
      id: 3,
      count: formatNumber(countInfo.paperNum),
      className: 'text-blue-600',
      title: '套试卷',
    },
    {
      id: 4,
      count: formatNumber(countInfo.teacherNum),
      className: 'text-pink-600',
      title: '位共建教师',
    },
    {
      id: 5,
      count: formatNumber(countInfo.studentNum),
      className: 'text-sky-600',
      title: '位学生',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-50 via-blue-100 via-40% to-blue-200 pt-20 pb-22.5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-25 right-[5%] size-100  bg-radial-[at_100%_0%] from-blue-500/15 via-transparent via-70% to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-[10%] size-75 bg-radial-[at_0%_100%] from-blue-900/10 via-transparent via-70% to-transparent"
      />

      <div className="relative mx-auto max-w-300 px-10">
        <div className="mx-auto max-w-215 text-center">
          <Badge className="mb-6 border-0 bg-blue-500/15 p-4 text-[13px] font-medium text-blue-900 shadow-none hover:bg-blue-500/15">
            📚 协同共创 · 智能开放教育生态
          </Badge>

          <h1 className="mb-4.5 text-[38px] leading-[1.4] font-bold text-blue-900">
            优质题库协同共创，AI 助力精准教学
            <br />
            <span className="text-gray-800">让每个学生获得适配自身的个性化学习路径</span>
          </h1>

          <p className="mx-auto mb-9 max-w-175 text-base leading-[1.8] text-gray-600">
            依托母子题分层资源，打造「教-学-练-评-补」全闭环智能开放教育生态
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 w-fit mx-auto justify-items-center">
            {stats.map((item) => (
              <div key={item.id} className="flex flex-col items-center justify-center p-4 text-center">
                <h2 className={cn('text-2xl font-bold', item.className)}>{item.count}</h2>
                <h6 className="text-muted-foreground text-sm">{item.title}</h6>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
