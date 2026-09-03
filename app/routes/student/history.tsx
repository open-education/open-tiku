import { useState } from "react";
import { SimpleNoData } from "~/common/empty";
import { SimplePagination } from "~/common/page";
import { ListShow } from "~/test/task";
import { useTestList } from "~/util/fetcher";
import { DateUtil } from "~/util/object";
import type { Route } from "./+types/history";
import React from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";
import { SimpleAlert } from "~/common/alert";

/// 学生做题首页
export function meta({}: Route.MetaArgs) {
  return [
    { title: "开放题库-历史任务" },
    {
      name: "description",
      content: "查看自己历史期间已布置的作业列表。",
    },
  ];
}

export default function Index() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 15);
    return { from, to };
  });

  // 历史任务默认前10天
  const [pageNo, setPageNo] = useState<number>(1);
  const {
    data: historyListResp = { list: [], pageNo: 1, pageSize: 10, total: 0 },
    isLoading: historyListRespLoading,
    error: historyListRespErr,
  } = useTestList(dateRange?.from ? DateUtil.formatDate(dateRange.from) : "", dateRange?.to ? DateUtil.formatDate(dateRange.to) : "", pageNo);

  return (
    <div className="px-4 py-4 sm:px-16 sm:py-4 space-y-4">
      {/* 搜索条件 */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">起止日期:</div>
          <div className="flex-1 flex items-center gap-2 min-w-0 max-w-md">
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal border-slate-300 text-slate-700 bg-white hover:border-slate-400 hover:bg-slate-50 shadow-sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? format(dateRange.from, "yyyy-MM-dd", { locale: zhCN }) : <span>开始日期</span>}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0 border border-slate-200 shadow-md bg-white block z-50" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={(date) => setDateRange((prev) => ({ from: date, to: prev?.to }))}
                  locale={zhCN}
                />
              </PopoverContent>
            </Popover>

            <span className="text-slate-400 shrink-0">至</span>

            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal border-slate-300 text-slate-700 bg-white hover:border-slate-400 hover:bg-slate-50 shadow-sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.to ? format(dateRange.to, "yyyy-MM-dd", { locale: zhCN }) : <span>结束日期</span>}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0 border border-slate-200 shadow-md bg-white block z-50" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange?.to}
                  onSelect={(date) => setDateRange((prev) => ({ from: prev?.from, to: date }))}
                  locale={zhCN}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {useDelayedLoading(historyListRespLoading) && <Loading />}

      {historyListRespErr && <SimpleAlert title="任务列表获取失败" message={historyListRespErr.message} />}

      {/* 任务列表 */}
      <div className="overflow-hidden border border-gray-100 bg-white shadow-sm">
        <div className="p-3">{historyListResp.total > 0 ? <ListShow listResp={historyListResp.list} /> : <SimpleNoData desc="历史任务为空" />}</div>

        {historyListResp.total > 0 && (
          <div className="my-3">
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
