import { getGreeting } from "~/util/greeting";
import type { Route } from "./+types/test";
import { CheckLine, ChevronRight, FileQuestionMark, GraduationCap, RotateCcw, Star, Target, Zap } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { SimplePagination } from "~/common/page";
import { DateUtil } from "~/util/object";
import { useTestList } from "~/util/fetcher";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";
import { SimpleAlert } from "~/common/alert";
import { useState } from "react";
import { ListShow } from "~/test/task";
import { SimpleNoData } from "~/common/empty";

/// 学生做题首页
export function meta({}: Route.MetaArgs) {
  return [
    { title: "开放题库-题目练习" },
    {
      name: "description",
      content:
        "查看自己历史期间做题总数、正确率、知识覆盖等训练信息；根据教师布置的作业进行针对性练习；也可以根据一些自动化的个性推荐，训练自己掌握不足的知识点。",
    },
  ];
}

// 练习首页概览
interface TestStatProps {
  id: number;
  icon: React.ElementType;
  count: string;
  className: string;
  title: string;
  desc: string;
}
const STATS: TestStatProps[] = [
  {
    id: 1,
    icon: FileQuestionMark,
    count: "12",
    className: "text-green-600",
    title: "今日练题",
    desc: "今天之内已做的题目数量之和",
  },
  {
    id: 2,
    icon: FileQuestionMark,
    count: "170",
    className: "text-blue-600",
    title: "历史练题",
    desc: "历史已做题目数量之和",
  },
  {
    id: 3,
    icon: Star,
    count: "3.2",
    className: "text-red-600",
    title: "平均难度",
    desc: "所有已做题目的难度之和 / 题目数量, 保留一位小数",
  },
  {
    id: 4,
    icon: CheckLine,
    count: "80%",
    className: "text-pink-600",
    title: "本周正确率",
    desc: "本周已做题目正确数 / 本周应做题目总数, 保留两位小数",
  },
  {
    id: 5,
    icon: CheckLine,
    count: "80%",
    className: "text-pink-600",
    title: "历史正确率",
    desc: "历史已做题目正确数 / 历史应做题目总数, 保留两位小数",
  },
  {
    id: 6,
    icon: GraduationCap,
    count: "17/120",
    className: "text-blue-600",
    title: "已掌握知识点",
    desc: "知识点下题目完成正确率达 90% 以上的知识点数量之和",
  },
];

export default function Test() {
  // 今日任务
  const { startDate, endDate } = DateUtil.getTodayDate();
  const {
    data: todayListResp = { list: [], pageNo: 1, pageSize: 10, total: 0 },
    isLoading: todayListRespLoading,
    error: todayListRespErr,
  } = useTestList(startDate, endDate, 1);

  // 历史任务默认前10天
  const [pageNo, setPageNo] = useState<number>(1);
  const { startDate: historyStartDate, endDate: historyEndDate } = DateUtil.getLast10Days();
  const {
    data: historyListResp = { list: [], pageNo: 1, pageSize: 10, total: 0 },
    isLoading: historyListRespLoading,
    error: historyListRespErr,
  } = useTestList(historyStartDate, historyEndDate, pageNo);

  return (
    <div className="px-4 py-4 sm:px-16 sm:py-4 space-y-4">
      {/* 欢迎 */}
      <div className="bg-white p-4">
        <div className="text-blue-500 font-semibold">{getGreeting()}</div>
        <div className="text-sm">七年级1班，已累计打卡 12 次</div>
      </div>

      <div>{useDelayedLoading(todayListRespLoading) && <Loading />}</div>

      <div>{todayListRespErr && <SimpleAlert title="今日任务获取失败" message={todayListRespErr.message} />}</div>

      {/* 已达成就 */}
      <div className="overflow-hidden border border-gray-100 bg-white shadow-sm">
        {/* 头部区域 */}
        <div className="border-b border-gray-100 p-4">
          <h3 className="font-semibold text-blue-600">已达成就</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-gray-50 p-3">
          {STATS.map((item) => (
            <Card key={item.id} className="border-0 text-center">
              <CardContent>
                <item.icon className={item.className} />
                <h2 className={cn("text-4xl font-bold", item.className)}>{item.count}</h2>
                <h6 className="mt-4 mb-2 text-base font-semibold">{item.title}</h6>
                <p className="text-foreground max-w-sm text-balance">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 今日任务 */}
      <div className="overflow-hidden border border-gray-100 bg-white shadow-sm">
        {/* 头部区域 */}
        <div className="border-b border-gray-100 p-4">
          <h3 className="font-semibold text-blue-600">今日任务</h3>
        </div>

        <div className="p-3">
          {todayListResp.total > 0 ? (
            <ListShow listResp={todayListResp.list} />
          ) : (
            <SimpleNoData desc="非常好，你还没有今日任务，可以去尝试做做其它的题目。" />
          )}
        </div>
      </div>

      {/* 个性化推荐 */}
      <div className="border border-gray-100 bg-white shadow-sm">
        {/* 头部区域 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-semibold text-blue-600">个性化推荐</h3>
          <span className="text-sm px-1.5 py-0.5">AI 定制</span>
        </div>

        <div className="p-3">
          {/* 列表区域 */}
          {[
            { I: Target, l: "薄弱点强化", d: "有理数运算 · 3题", iconClass: "text-rose-500" },
            { I: RotateCcw, l: "错题复习", d: "遗忘曲线提醒 · 5题", iconClass: "text-amber-500" },
            { I: Zap, l: "挑战拓展题", d: "几何证明入门 · 2题", iconClass: "text-purple-600" },
          ].map(({ I, l, d, iconClass }, i) => (
            <div
              key={i}
              onClick={() => {}}
              className={`flex items-center gap-2.5 py-2.5 cursor-pointer transition-colors duration-100 hover:bg-gray-100 px-1 -mx-1 ${
                i > 0 ? "border-t border-gray-100" : ""
              }`}
            >
              {/* 左侧图标 */}
              <I size={15} className={`shrink-0 ${iconClass}`} />

              {/* 中间文本 */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-800 truncate">{l}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{d}</p>
              </div>

              {/* 右侧箭头 */}
              <ChevronRight size={13} className="text-gray-300 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 历史任务 */}
      <div className="overflow-hidden border border-gray-100 bg-white shadow-sm">
        {/* 头部区域 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-semibold text-blue-600">历史任务</h3>
          <span className="text-sm px-1.5 py-0.5">查看更多</span>
        </div>

        <div className="p-3">{historyListResp.total > 0 ? <ListShow listResp={historyListResp.list} /> : <SimpleNoData desc="历史任务为空" />}</div>

        {historyListResp.total > 0 && (
          <div className="mt-3">
            <SimplePagination
              pageNo={historyListResp.pageNo}
              pageSize={historyListResp.pageSize}
              total={historyListResp.total}
              onPageChange={(pageNo) => setPageNo(pageNo)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
