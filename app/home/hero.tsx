import { Badge } from '~/components/ui/badge';
import { cn } from 'cn';

/// 统计相关

// 总数统计
interface CountStatProps {
  id: number;
  count: string;
  className: string;
  title: string;
}
// 网站统计概览
const STATS: CountStatProps[] = [
  {
    id: 1,
    count: '12',
    className: 'text-orange-600',
    title: '教材总数',
  },
  {
    id: 2,
    count: '3200',
    className: 'text-green-600',
    title: '题目总数',
  },
  {
    id: 3,
    count: '1300',
    className: 'text-blue-600',
    title: '试卷套数',
  },
  {
    id: 4,
    count: '35',
    className: 'text-pink-600',
    title: '教师人数',
  },
];

// 使命界面
function Hero() {
  return (
    <section>
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-28">
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5">
            我们的使命
          </Badge>
          <h1 className="mx-auto mb-6 max-w-4xl scroll-m-20 text-center text-4xl leading-tight! font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
            精准定位教材，高效组题练习
          </h1>
          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-left text-base leading-relaxed md:text-lg lg:text-xl">
            根据中小学教材章节和教育部发布的考点进行选题，精选历年高考中考和名校期末月考等试卷，手动根据需要和学情自主组卷，辅助教学视频等提供以素养为导向的精准教学、练题平台。
          </p>
        </div>

        <div className="container mx-auto">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 w-fit mx-auto justify-items-center">
            {STATS.map((item) => (
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

export { Hero };
