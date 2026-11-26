import { SimpleAlert } from '@/components/common/alert';
import { SimpleFullContent } from '@/components/common/content';
import { SimpleNoData } from '@/components/common/empty';
import { Loading } from '@/components/common/load';
import { ChapterDropdownNav } from '@/components/common/nav';
import { SimplePagination } from '@/components/common/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import type { TaskListReq } from '@/type/task';
import type { TextbookFillLevel, TextbookResp } from '@/type/textbook';
import { useCustomList, useQuestionCates, useTaskList, useTextbooks } from '@/util/fetcher';
import { StringConst } from '@/util/string';
import { CalendarDays, ChevronDown, Clock, Download, FileText, Mail, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CustomPageSource, CustomUserSource } from '@/type/enum';
import { formatNumber } from '@/util/fmt';
import { CustomUtil, TextbookUtil } from '@/util/object';
import type { Route } from './+types/task';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的任务' },
    {
      name: 'description',
      content: '查看我上传的任务列表',
    },
  ];
}

// 根据 status 数字返回精确的 Badge 样式类与状态圆点颜色
const getStatusStyle = (status: number): { badge: string; dot: string } => {
  switch (status) {
    case 1:
      return {
        badge: 'bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-100',
        dot: 'bg-slate-400',
      }; // 待处理 - 中性灰
    case 2:
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-50',
        dot: 'bg-blue-500 animate-pulse',
      }; // 处理中 - 动感蓝
    case 3:
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-50',
        dot: 'bg-emerald-500',
      }; // 成功 - 自然绿
    case 10:
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-50',
        dot: 'bg-rose-500',
      }; // 失败 - 警示红
    default:
      return {
        badge: 'bg-gray-100 text-gray-500 border-gray-200',
        dot: 'bg-gray-400',
      }; // 未知状态兜底
  }
};

// 在单条任务卡片内部（建议抽成一个独立的 TaskCard 子组件以便维护各自的展开状态）
function TaskResultSection({ result }: { result: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-background border border-border/50 p-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/85">
          <FileText size={13} className="shrink-0 text-muted-foreground" />
          <span>处理结果明细</span>
        </div>

        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <span>{isOpen ? '收起' : '展开'}</span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="pt-2 mt-2 border-t border-border/40">
        <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1 text-xs text-muted-foreground break-all">
          {result.split('\n').map((line, index) => (
            <div key={index} className="leading-relaxed">
              <SimpleFullContent content={line} />
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Index() {
  const [pageNo, setPageNo] = useState<number>(1);

  const [listReq, setListReq] = useState<TaskListReq>({
    chapterPath: '',
    knowledgePath: '',
    questionCateId: 0,
    taskType: StringConst.taskTypeUploadQuestion,
    pageNo: pageNo,
    pageSize: StringConst.pageSize,
  });
  const updateListReq = (key: keyof TaskListReq, value: number | string) => {
    setListReq((prev) => ({ ...prev, [key]: value }));
  };

  const [fillLevel, setFillLevel] = useState<TextbookFillLevel>({
    fiveLevelKeys: [],
    eightLevelKeys: [],
  });
  const updateFillLevel = (key: keyof TextbookFillLevel, value: string[]) => {
    setFillLevel((prev) => ({ ...prev, [key]: value }));
  };

  // 5层导航信息
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(5);

  // 获取教材/知识点题型列表
  const [fiveLevelId, setFiveLevelId] = useState<number>(0);
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(fiveLevelId);

  // 用户个性化配置
  const {
    data: customListResp = [],
    isLoading: customListRespLoading,
    error: customListRespErr,
  } = useCustomList({
    userSource: CustomUserSource.Person,
    pageSource: CustomPageSource.Default,
  });
  useEffect(() => {
    CustomUtil.defaultTextbookUpdate(customListResp, updateFillLevel, updateListReq, setFiveLevelId);
  }, [customListResp]);

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

  const showLoading = useDelayedLoading(textbooksLoading || questionCatesLoading || listRespLoading || customListRespLoading);

  return (
    <div className="space-y-3">
      {showLoading && <Loading />}

      <div className="flex flex-col gap-3 text-sm bg-card p-3">
        {/* 选择前5层级 */}
        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            知识点/章节:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <ChapterDropdownNav
              textbooks={textbooks}
              onSelect={(selectedItems: TextbookResp[]) => {
                TextbookUtil.textbookPathUpdate(selectedItems, updateListReq, setFiveLevelId);
              }}
              defaultSelectedKeys={fillLevel.fiveLevelKeys}
              placeholder="请选择知识点/章节"
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
              defaultSelectedKeys={fillLevel.eightLevelKeys}
              placeholder="请选择题型"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {textbooksErr && <SimpleAlert title="导航信息获取失败" message={textbooksErr.message} />}
        {questionCatesErr && <SimpleAlert title="题型信息获取失败" message={questionCatesErr.message} />}
        {listRespErr && <SimpleAlert title="任务列表获取失败" message={listRespErr.message} />}
        {customListRespErr && <SimpleAlert title="个性化信息获取失败" message={customListRespErr.message} />}
      </div>

      {listResp.total == 0 && <SimpleNoData desc="当前没有查询到任何历史任务" />}

      {listResp.total > 0 && <div>共找到 {formatNumber(listResp.total)} 个任务</div>}

      {listResp.list.map((task) => {
        const statusStyle = getStatusStyle(task.status);
        const downloadFileName = `${task.name}${task.name.toLowerCase().endsWith('.md') ? '' : '.md'}`;

        return (
          <Card key={task.id} className="mt-3 transition-all duration-200 hover:shadow-lg hover:border-primary/10 flex flex-col border-border/60">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2.5 px-4">
              {/* 左侧：任务名称 + 状态徽章 */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <CardTitle className="text-sm font-semibold leading-snug truncate text-foreground" title={task.name}>
                  {task.name}
                </CardTitle>
                <Badge className={`${statusStyle.badge} shrink-0 border px-2 py-0.5 text-xs font-medium gap-1.5`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {task.statusDesc}
                </Badge>
              </div>

              {/* 右侧：下载按钮 */}
              {task.url && (
                <a href={`/api/file/read/file/${task.url}`} download={downloadFileName} target="_blank" rel="noreferrer" className="shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Download size={13} />
                    <span>下载</span>
                  </Button>
                </a>
              )}
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
              {task.result && <TaskResultSection result={task.result} />}

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
        );
      })}

      {listResp.total > 0 && (
        <div className="py-3 bg-card">
          <SimplePagination pageNo={listResp.pageNo} pageSize={listResp.pageSize} total={listResp.total} onPageChange={(val) => setPageNo(val)} />
        </div>
      )}
    </div>
  );
}
