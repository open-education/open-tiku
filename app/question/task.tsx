import React, { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { TaskListReq, TaskSaveReq } from "~/type/task";
import { Separator } from "~/components/ui/separator";
import { FileUpload } from "~/common/file";
import { ChapterDropdownNav } from "~/common/nav";
import type { QuestionSearch } from "~/type/question";
import { useQuestionCates, useTaskList, useTextbooks } from "~/util/fetcher";
import type { Textbook } from "~/type/textbook";
import { createTextbookPathDict } from "~/util/textbook-dict";
import { StringConst, StringValidator } from "~/util/string";
import { Loading } from "~/common/load";
import { SimpleAlert } from "~/common/alert";
import { httpClient } from "~/util/http";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CalendarDays, Clock, FileImage, FileText, Mail, User } from "lucide-react";
import { SimplePagination } from "~/common/page";
import { QuickToolList } from "~/common/tool";
import { SimpleNoData } from "~/common/empty";
import { useDelayedLoading } from "~/hooks/delayed-loading";

/// 题目上传任务

// 上传题目文件
interface TaskAddProps {
  questionSearch: QuestionSearch; // 列表页面搜索携带的信息

  // 以下为 Sheet 操作方法和属性
  setSheetTitle?: (value: string) => void;
  setSheetDesc?: (value: string) => void;
  setSheetContent?: (value: React.ReactNode) => void;
}

function TaskAdd({ questionSearch, setSheetTitle, setSheetDesc, setSheetContent }: TaskAddProps) {
  const initAddReq = useMemo(() => {
    // 初始化部分默认值
    const initAddDefault: TaskSaveReq = {
      questionCateId: 0,
      taskType: StringConst.taskTypeUploadQuestion,
      name: "",
      url: "",
      email: "",
      textbookId: 0,
    };

    // questionSearch 为列表页传递过来的数据, 可能选也可能为空
    if (questionSearch.eightIds.length > 0) {
      initAddDefault.questionCateId = questionSearch.eightIds[0];
    }

    return initAddDefault;
  }, []);
  const [addReq, setAddReq] = useState<TaskSaveReq>(initAddReq);
  const updateAddReq = (key: keyof TaskSaveReq, value: number | string) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
  };

  // 两层导航信息要单独管理
  const [fiveLevelId, setFiveLevelId] = useState<number>(questionSearch.fiveLevelId);

  // 5层导航信息
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(5);
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap: Map<string, Textbook[]> = createTextbookPathDict(textbooks);

  useEffect(() => {
    // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再2层深度上, 因此只要有2层深度就可以把题型类型和标签返回, 后续如果有优化再处理
    // 很明显 fiveLevelId 是选择下拉菜单触发的优先级最高
    const nodes = pathMap.get(fiveLevelId.toString()) ?? [];
    const twoLevelId = nodes.length > 2 ? nodes[1].id : 0;
    updateAddReq("textbookId", twoLevelId);
  }, [fiveLevelId]);

  // 获取教材/考点题型列表
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(fiveLevelId);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [warnInfo, setWarnInfo] = useState<React.ReactNode>("");

  // 添加任务
  const handleAddTask = () => {
    // 必要的参数校验
    if (addReq.textbookId <= 0) {
      toast.error(<div className="text-red-700">章节/考点不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.questionCateId <= 0) {
      toast.error(<div className="text-red-700">第8级菜单题型不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.name)) {
      toast.error(<div className="text-red-700">文件名称不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.url)) {
      toast.error(<div className="text-red-700">文件标识不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    setIsLoading(true);
    httpClient
      .post<number>("/task/add", addReq)
      .then((taskId) => {
        // 添加成功后调整到任务列表
        setSheetTitle?.("任务列表");
        setSheetDesc?.("任务执行周期大概是每5分钟执行一次, 请稍微等待查看任务执行结果");
        setSheetContent?.(<TaskListShow questionSearch={questionSearch} />);
      })
      .catch((err) => setWarnInfo(<SimpleAlert title="任务添加失败" message={err.message} />))
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="text-base space-y-6 pl-4 pr-4">
      <div className="text-sm">
        <div>1. 文件标识请使用右上角的 快捷工具-上传文件 上传文件后获得</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="default" className="text-sm" onClick={handleAddTask}>
          保存任务
        </Button>
      </div>

      <Separator />

      <div>
        <QuickToolList
          tools={[
            {
              id: "tool-file-upload",
              label: (
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">上传文件</span>
                </div>
              ),
              content: <FileUpload isImage={false} />,
            },
          ]}
          defaultToolId="tool-file-upload"
        />
      </div>

      {(isLoading || textbooksLoading || questionCatesLoading) && <Loading />}

      {textbooksErr && <SimpleAlert title="导航信息获取失败" message={textbooksErr.message} />}
      {questionCatesErr && <SimpleAlert title="题型信息获取失败" message={questionCatesErr.message} />}

      {warnInfo}

      <div className="flex flex-col gap-3">
        {/* 选择前5层级 */}
        <div className="grid grid-cols-10 gap-1 items-center">
          <div className="col-span-1">
            章节/考点:<span className="text-destructive">*</span>
          </div>
          <div className="col-span-9">
            <ChapterDropdownNav
              textbooks={textbooks}
              onSelect={(selectedItems: Textbook[]) => {
                if (!selectedItems) {
                  setFiveLevelId(0);
                  return;
                }

                const current: Textbook = selectedItems[selectedItems.length - 1];
                setFiveLevelId(current.id);
              }}
              defaultSelectedKeys={questionSearch.fiveLevelSelectKeys || []}
              placeholder="请选择学段/考点"
            />
          </div>
        </div>

        {/* 根据前5层级选择后3层级 */}
        <div className="grid grid-cols-10 gap-4 items-center">
          <div className="col-span-1">
            题型:<span className="text-destructive">*</span>
          </div>
          <div className="col-span-9">
            <ChapterDropdownNav
              textbooks={questionCates}
              onSelect={(selectedItems: Textbook[]) => {
                if (!selectedItems) {
                  updateAddReq("questionCateId", 0);
                  return;
                }

                const current: Textbook = selectedItems[selectedItems.length - 1];
                // 必须选择题型
                if (current.tableName !== StringConst.questionCateTableName) {
                  updateAddReq("questionCateId", 0);
                  return;
                }

                updateAddReq("questionCateId", current.id);
              }}
              defaultSelectedKeys={questionSearch.eightLevelSelectKeys || []}
              placeholder="请选择题型"
            />
          </div>
        </div>

        <div className="grid grid-cols-10 gap-4 items-center">
          <div className="col-span-1">
            文件名称:<span className="text-destructive">*</span>
          </div>
          <div className="col-span-9">
            <Input
              id="task-file-name"
              className="text-sm md:text-sm"
              placeholder="例如 题型S-1-1-1 有理数的概念.md"
              value={addReq.name}
              onChange={(e) => {
                updateAddReq("name", e.target.value);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-10 gap-4 items-center">
          <div className="col-span-1">
            文件标识:<span className="text-destructive">*</span>
          </div>
          <div className="col-span-9">
            <Input
              id="task-file-id"
              className="text-sm md:text-sm"
              placeholder="文件标识, 右上角上传文件获得"
              value={addReq.url}
              onChange={(e) => {
                updateAddReq("url", e.target.value);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-10 gap-4 items-center">
          <div className="col-span-1">
            邮箱地址:<span className="text-destructive">*</span>
          </div>
          <div className="col-span-9">
            <Input
              id="task-file-email"
              className="text-sm md:text-sm"
              placeholder="邮箱地址"
              value={addReq.email}
              onChange={(e) => {
                updateAddReq("email", e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 任务列表展示
interface TaskListShowProps {
  questionSearch: QuestionSearch; // 列表页面搜索携带的信息
}

// 根据 status 数字返回精确的 Badge 样式类
const getStatusBadgeClasses = (status: number): string => {
  switch (status) {
    case 1:
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100"; // 待处理 - 中性灰
    case 2:
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"; // 处理中 - 动感蓝
    case 3:
      return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"; // 成功 - 自然绿
    case 10:
      return "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100"; // 失败 - 警示红
    default:
      return "bg-gray-100 text-gray-500 border-gray-200"; // 未知状态兜底
  }
};
function TaskListShow({ questionSearch }: TaskListShowProps) {
  const initAddReq = useMemo(() => {
    // 初始化部分默认值
    const initAddDefault: TaskListReq = {
      questionCateId: 0,
      taskType: StringConst.taskTypeUploadQuestion,
      pageNo: 1,
      pageSize: StringConst.pageSize,
    };

    // questionSearch 为列表页传递过来的数据, 可能选也可能为空
    if (questionSearch.eightIds.length > 0) {
      initAddDefault.questionCateId = questionSearch.eightIds[0];
    }

    return initAddDefault;
  }, []);
  const [listReq, setListReq] = useState<TaskListReq>(initAddReq);
  const updateListReq = (key: keyof TaskListReq, value: number | string) => {
    setListReq((prev) => ({ ...prev, [key]: value }));
  };

  // 两层导航信息要单独管理
  const [fiveLevelId, setFiveLevelId] = useState<number>(questionSearch.fiveLevelId);

  // 5层导航信息
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(5);

  // 获取教材/考点题型列表
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(fiveLevelId);

  // 查询任务列表
  const {
    data: listResp = {
      list: [],
      pageNo: 1,
      pageSize: StringConst.pageSize,
      total: 0,
    },
    isLoading: listRespLoading,
    error: listRespErr,
  } = useTaskList(listReq);

  return (
    <div className="p-4 text-base">
      <Separator />

      {useDelayedLoading(textbooksLoading || questionCatesLoading || listRespLoading) && <Loading />}

      {textbooksErr && <SimpleAlert title="导航信息获取失败" message={textbooksErr.message} />}
      {questionCatesErr && <SimpleAlert title="题型信息获取失败" message={questionCatesErr.message} />}
      {listRespErr && <SimpleAlert title="任务列表获取失败" message={listRespErr.message} />}

      <div className="flex flex-col gap-3 pt-4 pb-4">
        {/* 选择前5层级 */}
        <div className="grid grid-cols-10 gap-1 items-center">
          <div className="col-span-1">
            章节/考点:<span className="text-destructive">*</span>
          </div>
          <div className="col-span-9">
            <ChapterDropdownNav
              textbooks={textbooks}
              onSelect={(selectedItems: Textbook[]) => {
                if (!selectedItems) {
                  setFiveLevelId(0);
                  return;
                }

                const current: Textbook = selectedItems[selectedItems.length - 1];
                setFiveLevelId(current.id);
              }}
              defaultSelectedKeys={questionSearch.fiveLevelSelectKeys || []}
              placeholder="请选择学段/考点"
            />
          </div>
        </div>

        {/* 根据前5层级选择后3层级 */}
        <div className="grid grid-cols-10 gap-4 items-center">
          <div className="col-span-1">
            题型:<span className="text-destructive">*</span>
          </div>
          <div className="col-span-9">
            <ChapterDropdownNav
              textbooks={questionCates}
              onSelect={(selectedItems: Textbook[]) => {
                if (!selectedItems) {
                  updateListReq("questionCateId", 0);
                  return;
                }

                const current: Textbook = selectedItems[selectedItems.length - 1];
                updateListReq("questionCateId", current.id);
              }}
              defaultSelectedKeys={questionSearch.eightLevelSelectKeys || []}
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
            <CardTitle className="text-base font-semibold leading-6 line-clamp-1 pr-2">{task.name}</CardTitle>
            <Badge className={`${getStatusBadgeClasses(task.status)} shrink-0 border text-sm font-normal`}>{task.statusDesc}</Badge>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-3 text-sm">
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

            {/* 结果信息（可选） */}
            {task.result && (
              <div className="flex items-start gap-1.5 p-2 bg-muted/40 rounded-md border border-border/40">
                <FileText size={14} className="shrink-0 mt-0.5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground break-all line-clamp-2">结果：{task.result}</div>
              </div>
            )}

            {/* 时间戳 - 置于底部 */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 mt-1 border-t border-border/40 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                <span>创建：{task.createdAt}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} />
                <span>更新：{task.updatedAt}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {listResp.total > 0 && (
        <div className="mt-3">
          <SimplePagination
            pageNo={listReq.pageNo}
            pageSize={StringConst.pageSize}
            total={listResp.total}
            onPageChange={(val) => updateListReq("pageNo", val)}
          />
        </div>
      )}
    </div>
  );
}

export { TaskAdd, TaskListShow };
