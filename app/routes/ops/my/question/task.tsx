import { SimpleAlert } from '@/components/common/alert';
import { SimpleFullContent } from '@/components/common/content';
import { SimpleNoData } from '@/components/common/empty';
import { Loading } from '@/components/common/load';
import { ChapterDropdownNav } from '@/components/common/nav';
import { SimplePagination } from '@/components/common/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import type { TaskListReq } from '@/type/task';
import type { TextbookResp } from '@/type/textbook';
import { useQuestionCates, useTaskList, useTextbooks } from '@/util/fetcher';
import { StringConst } from '@/util/string';
import { CalendarDays, Clock, FileText, Mail, User } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Route } from './+types/task';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的贡献-我的任务' },
    {
      name: 'description',
      content: '查看我上传的任务列表',
    },
  ];
}

// 根据 status 数字返回精确的 Badge 样式类
const getStatusBadgeClasses = (status: number): string => {
  switch (status) {
    case 1:
      return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100'; // 待处理 - 中性灰
    case 2:
      return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100'; // 处理中 - 动感蓝
    case 3:
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100'; // 成功 - 自然绿
    case 10:
      return 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100'; // 失败 - 警示红
    default:
      return 'bg-gray-100 text-gray-500 border-gray-200'; // 未知状态兜底
  }
};

export default function Index() {
  const [pageNo, setPageNo] = useState<number>(1);

  const initAddReq = useMemo(() => {
    // 初始化部分默认值
    const initAddDefault: TaskListReq = {
      questionCateId: 0,
      taskType: StringConst.taskTypeUploadQuestion,
      pageNo: pageNo,
      pageSize: StringConst.pageSize,
    };

    return initAddDefault;
  }, []);
  const [listReq, setListReq] = useState<TaskListReq>(initAddReq);
  const updateListReq = (key: keyof TaskListReq, value: number | string) => {
    setListReq((prev) => ({ ...prev, [key]: value }));
  };

  // 两层导航信息要单独管理
  const [fiveLevelId, setFiveLevelId] = useState<number>(0);

  // 5层导航信息
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(5);

  // 获取教材/考点题型列表
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(fiveLevelId);

  // 查询任务列表
  const {
    data: listResp = {
      list: [],
      pageNo: pageNo,
      pageSize: StringConst.pageSize,
      total: 0,
    },
    isLoading: listRespLoading,
    error: listRespErr,
  } = useTaskList(listReq, pageNo, StringConst.pageSize);

  const showLoading = useDelayedLoading(textbooksLoading || questionCatesLoading || listRespLoading);

  return (
    <div className="bg-card p-3 space-y-3">
      {showLoading && <Loading />}

      {textbooksErr && <SimpleAlert title="导航信息获取失败" message={textbooksErr.message} />}
      {questionCatesErr && <SimpleAlert title="题型信息获取失败" message={questionCatesErr.message} />}
      {listRespErr && <SimpleAlert title="任务列表获取失败" message={listRespErr.message} />}

      <div className="flex flex-col gap-3 text-sm">
        {/* 选择前5层级 */}
        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            章节/考点:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <ChapterDropdownNav
              textbooks={textbooks}
              onSelect={(selectedItems: TextbookResp[]) => {
                if (!selectedItems) {
                  setFiveLevelId(0);
                  return;
                }

                const current: TextbookResp = selectedItems[selectedItems.length - 1];
                setFiveLevelId(current.id);
              }}
              defaultSelectedKeys={[]}
              placeholder="请选择学段/考点"
            />
          </div>
        </div>

        {/* 根据前5层级选择后3层级 */}
        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            题型:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <ChapterDropdownNav
              textbooks={questionCates}
              onSelect={(selectedItems: TextbookResp[]) => {
                if (!selectedItems) {
                  updateListReq('questionCateId', 0);
                  return;
                }

                const current: TextbookResp = selectedItems[selectedItems.length - 1];
                updateListReq('questionCateId', current.id);
              }}
              defaultSelectedKeys={[]}
              placeholder="请选择题型"
            />
          </div>
        </div>
      </div>

      <Separator />

      {listResp.total == 0 && <SimpleNoData desc="当前没有查询到任何历史任务" />}

      {listResp.list.map((task) => (
        <Card key={task.id} className="mt-3 transition-all duration-200 hover:shadow-lg hover:border-primary/10 flex flex-col border-border/60">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold leading-6 line-clamp-1 pr-2">{task.name}</CardTitle>
            <div>
              <a
                href={`/api/file/read/file/${task.url}`}
                download={`${task.name}${task.name.toLowerCase().endsWith('.md') ? '' : '.md'}`}
                target="_blank"
              >
                <Button variant="link">下载</Button>
              </a>
            </div>
            <Badge className={`${getStatusBadgeClasses(task.status)} shrink-0 border font-normal`}>{task.statusDesc}</Badge>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-3">
            {/* 作者 & 邮箱 */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User size={14} className="shrink-0" />
                <span className="font-medium text-foreground">{task.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="shrink-0" />
                <span className="truncate max-w-37.5">{task.email}</span>
              </div>
            </div>

            {/* 结果信息 */}
            {task.result && (
              <div className="flex items-start gap-1.5 p-2 bg-muted border border-border/40">
                <FileText size={14} className="shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex flex-col text-sm text-muted-foreground break-all w-full">
                  <div className="text-xs font-medium text-foreground mb-1">处理结果明细：</div>
                  <div className="max-h-25 overflow-y-auto pr-1 flex flex-col gap-0.5 scrollbar-thin">
                    {task.result.split('\n').map((line, index) => (
                      <div key={index}>
                        <SimpleFullContent content={line} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 时间戳 - 置于底部 */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 mt-1 border-t border-border/40 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                <span>创建时间：{task.createdAt}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} />
                <span>更新时间：{task.updatedAt}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {listResp.total > 0 && (
        <div className="mt-3">
          <SimplePagination pageNo={listResp.pageNo} pageSize={listResp.pageSize} total={listResp.total} onPageChange={(val) => setPageNo(val)} />
        </div>
      )}
    </div>
  );
}
