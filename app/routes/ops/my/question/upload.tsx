import { SimpleAlert } from '@/components/common/alert';
import { Loading } from '@/components/common/load';
import { ChapterDropdownNav } from '@/components/common/nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { TaskSaveReq } from '@/type/task';
import type { TextbookFillLevel, TextbookResp } from '@/type/textbook';
import { useCustomList, useQuestionCates, useTextbooks } from '@/util/fetcher';
import { httpClient } from '@/util/http';
import { CustomUtil } from '@/util/object';
import { StringConst, StringValidator } from '@/util/string';
import { Save } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import FileUpload from '@/components/common/upload';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import { CustomPageSource, CustomUserSource, UploadFileType } from '@/type/enum';
import { useNavigate } from 'react-router';
import type { Route } from './+types/upload';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '上传任务' },
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
      twoLevelId: 0,
      fiveLevelId: 0,
      questionCateId: 0,
      taskType: StringConst.taskTypeUploadQuestion,
      name: '',
      url: '',
      email: '',
    };

    return initAddDefault;
  }, []);
  const [addReq, setAddReq] = useState<TaskSaveReq>(initAddReq);
  const updateAddReq = (key: keyof TaskSaveReq, value: number | string) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
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
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(addReq.fiveLevelId);

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
    CustomUtil.questionTaskUploadUpdate(customListResp, updateAddReq, updateFillLevel);
  }, [customListResp]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [warnInfo, setWarnInfo] = useState<React.ReactNode>('');

  // 添加任务
  const handleAddTask = () => {
    // 必要的参数校验
    if (addReq.twoLevelId <= 0) {
      toast.error(<div className="text-red-700">第2层级菜单科目不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.fiveLevelId <= 0) {
      toast.error(<div className="text-red-700">第5层级菜单章节/知识点不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.questionCateId <= 0) {
      toast.error(<div className="text-red-700">第8层级菜单题型不能为空</div>, {
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
      .then((_) => {
        // 添加成功后跳转到任务列表
        navigation('/ops/my/question/task', { replace: true });
      })
      .catch((err) => setWarnInfo(<SimpleAlert title="任务添加失败" message={err.message} />))
      .finally(() => {
        setIsLoading(false);
      });
  };

  const showLoading = useDelayedLoading(isLoading || textbooksLoading || questionCatesLoading || customListRespLoading);

  return (
    <div className="bg-card p-3 space-y-3">
      <div className="text-sm space-y-2">
        <div>1. 文件标识请使用右上角的 快捷工具-上传文件 上传文件后获得</div>
        <div>2. 模板请参考下面下载模板, 如果模板有变更需要练习管理员更新支持后才会生效</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="default" className="text-sm" onClick={handleAddTask}>
          <Save className="mr-2 h-4 w-4" />
          保存任务
        </Button>
      </div>

      <Separator />

      {showLoading && <Loading />}

      <div className="space-y-2">
        {textbooksErr && <SimpleAlert title="导航信息获取失败" message={textbooksErr.message} />}
        {questionCatesErr && <SimpleAlert title="题型信息获取失败" message={questionCatesErr.message} />}
        {customListRespErr && <SimpleAlert title="个性化配置信息获取失败" message={customListRespErr.message} />}
        {warnInfo}
      </div>

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
            知识点/章节:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <ChapterDropdownNav
              textbooks={textbooks}
              onSelect={(selectedItems: TextbookResp[]) => {
                const [, secondItem = null, , , fifthItem = null] = selectedItems ?? [];
                updateAddReq('twoLevelId', secondItem ? secondItem.id : 0);
                updateAddReq('fiveLevelId', fifthItem ? fifthItem.id : 0);
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
              defaultSelectedKeys={fillLevel.eightLevelKeys}
              placeholder="请选择题型"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            上传文件:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <FileUpload
              fileType={UploadFileType.Markdown}
              className="lg:w-[20%]"
              onChange={(values) => {
                // 只支持上传一个文件
                if (!values) {
                  return;
                }
                if (values.length != 1) {
                  setWarnInfo(<SimpleAlert title="文件数量检查失败" message="上传题目仅支持上传一个文件" />);
                  return;
                }
                const val = values[0].resp;
                updateAddReq('name', val.originalName);
                updateAddReq('url', val.url);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            文件名称:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <Input id="task-file-name" className="lg:w-[30%]" placeholder="例如 题型S-1-1-1 有理数的概念.md" value={addReq.name} disabled />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">
            文件标识:<span className="text-destructive">*</span>
          </div>
          <div className="min-w-0 flex-1">
            <Input id="task-file-id" className="lg:w-[30%]" placeholder="文件标识, 右上角上传文件获得" value={addReq.url} disabled />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-[6em] shrink-0 whitespace-nowrap">邮箱地址:</div>
          <div className="min-w-0 flex-1">
            <Input
              id="task-file-email"
              className="lg:w-[30%]"
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
