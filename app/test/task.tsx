import { CheckCircle, ChevronRight, Flag, PenTool } from "lucide-react";
import { NavLink } from "react-router";
import { TagShow } from "~/common/paper/tag";
import { Button } from "~/components/ui/button";
import { TestMethod } from "~/type/enum";
import type { TestInfoResp } from "~/type/test";
import { DateUtil } from "~/util/object";

// 一个任务列表
interface ListShowProps {
  listResp: TestInfoResp[];
}

function ListShow({ listResp }: ListShowProps) {
  return (
    <>
      {/* 任务列表 */}
      {listResp.map((item) => {
        const isCompleted = 0 == item.paperInfo.count;
        // 是否截止今日
        const isUrgent = DateUtil.isTodayLocal(item.deadline);

        return (
          <div
            key={item.id}
            onClick={() => {}}
            className="px-4 py-3 border-t border-gray-100 flex items-center gap-2.5 cursor-pointer transition-colors duration-100 hover:bg-gray-100"
          >
            {/* 左侧状态图标容器 */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isCompleted ? "bg-green-50 text-green-600" : isUrgent ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
              }`}
            >
              {isCompleted ? (
                <CheckCircle size={15} className="currentColor" />
              ) : isUrgent ? (
                <Flag size={15} className="currentColor" />
              ) : (
                <PenTool size={15} className="currentColor" />
              )}
            </div>

            {/* 中间文本与进度条 */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* 生成标签 */}
              <div className="flex flex-wrap gap-3 items-center w-full">
                <TagShow
                  relatedName={item.paperInfo.relatedName ?? ""}
                  tag={item.paperInfo.tag}
                  year={item.paperInfo.year}
                  grade={item.paperInfo.grade ?? ""}
                  semester={item.paperInfo.semester ?? ""}
                />
              </div>
              <p className="font-medium text-gray-800 truncate">{item.paperInfo.title}</p>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-400 shrink-0">
                  {item.paperInfo.authorName} · {0}/{item.paperInfo.count}题
                </p>
                {/* 进度条背景 */}
                <div className="flex-1 h-0.75 bg-gray-100">
                  {/* 进度条高亮 */}
                  <div className="h-0.75 bg-blue-200 transition-all duration-300" style={{ width: `${(10 / item.paperInfo.count) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <Button variant="link">
                <NavLink to={`/exam/${item.paperInfo.id}/${TestMethod.Exercise}`} state={{ hId: item.id }}>
                  练习模式
                </NavLink>
              </Button>
              <Button variant="link">
                <NavLink to={`/exam/${item.paperInfo.id}/${TestMethod.Exam}`} state={{ hId: item.id }}>
                  考试模式
                </NavLink>
              </Button>
              <Button variant="link">
                <NavLink to={`/exam/${item.paperInfo.id}/2/attempt`} state={{ hId: item.id }}>
                  历史记录
                </NavLink>
              </Button>
            </div>

            {/* 右侧紧急标签与箭头 */}
            {isUrgent && <span className="text-xs px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-semibold shrink-0">截止今天</span>}
          </div>
        );
      })}
    </>
  );
}

export { ListShow };
