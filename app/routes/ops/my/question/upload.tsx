import { SimpleAlert } from '@/components/common/alert';
import { FileUpload } from '@/components/common/file';
import { Loading } from '@/components/common/load';
import { ChapterDropdownNav } from '@/components/common/nav';
import { QuickToolList } from '@/components/common/tool';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { TaskSaveReq } from '@/type/task';
import type { TextbookResp } from '@/type/textbook';
import { useQuestionCates, useTextbooks } from '@/util/fetcher';
import { httpClient } from '@/util/http';
import { TextbookUtil } from '@/util/object';
import { StringConst, StringValidator } from '@/util/string';
import { FileImage } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { Route } from './+types/upload';
import { useNavigate } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的贡献-上传任务' },
    {
      name: 'description',
      content: '查看我上传的任务列表',
    },
  ];
}

/// 题目上传任务

export default function Index() {
  const navigation = useNavigate();

  const initAddReq = useMemo(() => {
    // 初始化部分默认值
    const initAddDefault: TaskSaveReq = {
      questionCateId: 0,
      taskType: StringConst.taskTypeUploadQuestion,
      name: '',
      url: '',
      email: '',
      textbookId: 0,
    };

    return initAddDefault;
  }, []);
  const [addReq, setAddReq] = useState<TaskSaveReq>(initAddReq);
  const updateAddReq = (key: keyof TaskSaveReq, value: number | string) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
  };

  // 两层导航信息要单独管理
  const [fiveLevelId, setFiveLevelId] = useState<number>(0);

  // 5层导航信息
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(5);
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap: Map<string, TextbookResp[]> = TextbookUtil.createTextbookPathDict(textbooks);

  useEffect(() => {
    // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再2层深度上, 因此只要有2层深度就可以把题型类型和标签返回, 后续如果有优化再处理
    // 很明显 fiveLevelId 是选择下拉菜单触发的优先级最高
    const nodes = pathMap.get(fiveLevelId.toString()) ?? [];
    const twoLevelId = nodes.length > 2 ? nodes[1].id : 0;
    updateAddReq('textbookId', twoLevelId);
  }, [fiveLevelId]);

  // 获取教材/考点题型列表
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(fiveLevelId);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [warnInfo, setWarnInfo] = useState<React.ReactNode>('');

  // 添加任务
  const handleAddTask = () => {
    // 必要的参数校验
    if (addReq.textbookId <= 0) {
      toast.error(<div className="text-red-700">章节/考点不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.questionCateId <= 0) {
      toast.error(<div className="text-red-700">第8级菜单题型不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.name)) {
      toast.error(<div className="text-red-700">文件名称不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.url)) {
      toast.error(<div className="text-red-700">文件标识不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }

    setIsLoading(true);

    httpClient
      .post<number>('/task/add', addReq)
      .then((taskId) => {
        // 添加成功后跳转到任务列表
        navigation('/ops/my/question/task', { replace: true });
      })
      .catch((err) => setWarnInfo(<SimpleAlert title="任务添加失败" message={err.message} />))
      .finally(() => {
        setIsLoading(false);
      });
  };

  const showLoading = isLoading || textbooksLoading || questionCatesLoading;

  return (
    <div className="bg-card p-3 space-y-3">
      <div className="text-sm space-y-2">
        <div>1. 文件标识请使用右上角的 快捷工具-上传文件 上传文件后获得</div>
        <div>2. 模板请参考下面下载模板, 如果模板有变更需要练习管理员更新支持后才会生效</div>
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
              id: 'tool-file-upload',
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

      {showLoading && <Loading />}

      {textbooksErr && <SimpleAlert title="导航信息获取失败" message={textbooksErr.message} />}
      {questionCatesErr && <SimpleAlert title="题型信息获取失败" message={questionCatesErr.message} />}

      {warnInfo}

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            下载模板:<span className="text-destructive">*</span>
          </div>
          <div className="flex gap-3 min-w-0 flex-1">
            <a href="/api/file/read/file/fctk_tpl.md" download="分层题库模板.md" target="_blank">
              <Button>分层题库模板.md</Button>
            </a>
            <a href="/api/file/read/file/fctk_tpl.docx" download="分层题库模板.docx" target="_blank">
              <Button>分层题库模板.docx</Button>
            </a>
          </div>
        </div>

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
                  updateAddReq('questionCateId', 0);
                  return;
                }

                const current: TextbookResp = selectedItems[selectedItems.length - 1];
                // 必须选择题型
                if (current.tableName !== StringConst.questionCateTableName) {
                  updateAddReq('questionCateId', 0);
                  return;
                }

                updateAddReq('questionCateId', current.id);
              }}
              defaultSelectedKeys={[]}
              placeholder="请选择题型"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            文件名称:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <Input
              id="task-file-name"
              placeholder="例如 题型S-1-1-1 有理数的概念.md"
              value={addReq.name}
              onChange={(e) => {
                updateAddReq('name', e.target.value);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            文件标识:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <Input
              id="task-file-id"
              placeholder="文件标识, 右上角上传文件获得"
              value={addReq.url}
              onChange={(e) => {
                updateAddReq('url', e.target.value);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            邮箱地址:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <Input
              id="task-file-email"
              placeholder="邮箱地址"
              value={addReq.email}
              onChange={(e) => {
                updateAddReq('email', e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
