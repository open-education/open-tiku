import { SimpleAlert } from '@/components/common/alert';
import { AnswerInfo } from '@/components/question/info';
import { SimilarListShow } from '@/components/question/list';
import { StatusSelect } from '@/components/question/status';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCopy } from '@/hooks/use-copy';
import { QuestionPageSource, QuestionRelationType, QuestionStatus } from '@/type/enum';
import type {
  QuestionApproveReq,
  QuestionBaseInfoResp,
  QuestionDeleteReq,
  QuestionInfoResp,
  QuestionListResp,
  QuestionSimilarListReq,
} from '@/type/question';
import type { OtherDictListRecord } from '@/type/textbook';
import { httpClient } from '@/util/http';
import React, { useState } from 'react';
import { toast } from 'sonner';
import type { KeyedMutator } from 'swr';

// 题目操作列表
interface QuestionOperateListProps {
  pageSource: QuestionPageSource;
  otherDictListRecord: OtherDictListRecord;
  baseInfoResp: QuestionBaseInfoResp;
  questionListRespMutate: KeyedMutator<QuestionListResp>; // 审核删除等操作需要重置列表接口重新请求数据
}
function QuestionOperateList({ pageSource, otherDictListRecord, baseInfoResp, questionListRespMutate }: QuestionOperateListProps) {
  // 查看答案详情
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [viewAnswerIng, setViewAnswerIng] = useState<boolean>(false);
  const [viewAnswerErr, setViewAnswerErr] = useState<React.ReactNode>(null);
  const [infoResp, setInfoResp] = useState<QuestionInfoResp | null>(null);

  const handleViewAnswerInfo = (open: boolean) => {
    setIsAnswerOpen(open);

    if (infoResp) {
      return;
    }

    setViewAnswerIng(true);
    setViewAnswerErr(null);

    httpClient
      .get<QuestionInfoResp>(`/question/info/${baseInfoResp.id}`)
      .then((res) => {
        setInfoResp(res);
      })
      .catch((err) => {
        setViewAnswerErr(<SimpleAlert title="查询题目详情出错" message={err.message} />);
      })
      .finally(() => {
        setViewAnswerIng(false);
      });
  };

  // 查看变式题
  const [isSimilarOpen, setIsSimilarOpen] = useState(false);
  const [viewSimilarIng, setViewSimilarIng] = useState<boolean>(false);
  const [viewSimilarErr, setViewSimilarErr] = useState<React.ReactNode>(null);
  const [similarListResp, setSimilarListResp] = useState<QuestionListResp | null>(null);

  const handleSimilarList = (open: boolean) => {
    setIsSimilarOpen(open);

    if (similarListResp !== null) {
      return;
    }

    setViewSimilarIng(true);
    setViewSimilarErr(null);

    const req: QuestionSimilarListReq = {
      questionId: baseInfoResp.id,
      questionCateId: baseInfoResp.questionCateId,
      pageNo: 1,
      pageSize: 50,
    };

    httpClient
      .post<QuestionListResp>('/question/similar', req)
      .then((res) => {
        setSimilarListResp(res);
      })
      .catch((err) => {
        setViewSimilarErr(<SimpleAlert title="查询变式题出错" message={err.message} />);
      })
      .finally(() => {
        setViewSimilarIng(false);
      });
  };

  // 简单的复制题目
  const { copy, copied } = useCopy();
  const handleCopyInfo = async () => {
    // 没详情就先同步等请求回来
    let detail = infoResp;
    if (!detail) {
      try {
        detail = await httpClient.get<QuestionInfoResp>(`/question/info/${baseInfoResp.id}`);
        setInfoResp(detail);
      } catch (err) {
        toast.error(<div className="text-red-700">查询题目详情失败: {(err as Error).message}, 无法复制</div>, {
          duration: Infinity,
          action: { label: '关闭', onClick: () => {} },
        });
        return;
      }
    }

    // 图片访问路径
    const origin = window.location.origin;
    const imageSrc = `${origin}/images`;

    // 题干图片
    let titleImages: string[] = [];
    if (baseInfoResp.images && baseInfoResp.images.length > 0) {
      baseInfoResp.images.map((fileId) => {
        titleImages.push(`${imageSrc}/${fileId}`);
      });
    }

    // 拼接选项
    const opt: string[] = [];
    if (baseInfoResp.options?.length) {
      baseInfoResp.options.forEach((item) => {
        // 目前图片和选项文本不能同时存在
        if (item.content) {
          opt.push(`${item.label}. ${item.content}`);
        } else if (item.images && item.images.length > 0) {
          // 选项图片暂时只关注一章的情形
          opt.push(`${item.label}. ${imageSrc}/${item.images[0]}`);
        }
      });
    }

    const fullMd = [
      `**题目：** ${baseInfoResp.title}`,
      titleImages.length > 0 ? titleImages.join('\n') : '',
      opt.length > 0 ? opt.join('\n') : '',
      `**参考答案：** ${detail.extraInfo.answer ?? ''}`,
      `**解题分析：** ${detail.extraInfo.analysis?.content ?? ''}`,
      `**解题过程：** ${detail.extraInfo.process?.content ?? ''}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    copy(fullMd);
  };

  // 提交审核
  const [openSubmitApprove, setOpenSubmitApprove] = useState<boolean>(false);
  const [submitApproving, setSubmitApproving] = useState<boolean>(false);

  const handleSubmitApprove = () => {
    setSubmitApproving(true);

    const req: QuestionApproveReq = {
      id: baseInfoResp.id,
      status: QuestionStatus.Pending,
      rejectReason: '',
    };
    httpClient
      .post('/edit/question/status', req)
      .then((res) => {
        questionListRespMutate();
        setOpenSubmitApprove(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">提交审核操作出错: {err.message}</div>);
      })
      .finally(() => {
        setSubmitApproving(false);
      });
  };

  // 删除题目
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDelete = () => {
    setDeleting(true);

    const req: QuestionDeleteReq = {
      id: baseInfoResp.id,
    };

    httpClient
      .post('/question/delete', req)
      .then((res) => {
        questionListRespMutate();
        setOpenDelete(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">删除题目出错: {err.message}</div>);
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  // 审核题目
  const [openConfirmApprove, setOpenConfirmApprove] = useState<boolean>(false);
  const [confirmApproving, setConfirmApproving] = useState<boolean>(false);

  const [approveReq, setApproveReq] = useState<QuestionApproveReq>({
    id: baseInfoResp.id,
    status: QuestionStatus.Drafing,
    rejectReason: '',
  });
  const updateApproveReq = (key: keyof QuestionApproveReq, value: number | string) => {
    setApproveReq((prev) => ({ ...prev, [key]: value }));
  };

  const handleApprove = () => {
    setConfirmApproving(true);

    httpClient
      .post('/edit/question/status', approveReq)
      .then((res) => {
        questionListRespMutate();
        setOpenConfirmApprove(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">审核操作出错: {err.message}</div>);
      })
      .finally(() => {
        setConfirmApproving(false);
      });
  };

  return (
    <div className="w-full space-y-3">
      {/* 答案解析内容 */}
      <Collapsible open={isAnswerOpen}>
        <CollapsibleContent className="transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down mt-3 p-3 bg-secondary border border-dotted border-blue-100">
          {viewAnswerErr || <AnswerInfo infoResp={infoResp} />}
        </CollapsibleContent>
      </Collapsible>

      {/* 按钮控制栏：一排堆叠，宽度不够自动换行 */}
      <div className="flex flex-wrap gap-2">
        {/* 答案解析控制按钮 */}
        <Collapsible open={isAnswerOpen} onOpenChange={handleViewAnswerInfo}>
          <CollapsibleTrigger
            render={
              <Button variant={isAnswerOpen ? 'default' : 'outline'} size="sm">
                {isAnswerOpen ? '收起答案解析' : viewAnswerIng ? '查询中...' : '查看答案解析'}
              </Button>
            }
          ></CollapsibleTrigger>
        </Collapsible>

        {/* 变式题控制按钮 */}
        {baseInfoResp.relationType === QuestionRelationType.Base && (
          <Collapsible open={isSimilarOpen} onOpenChange={handleSimilarList}>
            <CollapsibleTrigger
              render={
                <Button variant={isSimilarOpen ? 'default' : 'outline'} size="sm">
                  {isSimilarOpen ? '收起变式题' : viewSimilarIng ? '查询中...' : '查看变式题'}
                </Button>
              }
            ></CollapsibleTrigger>
          </Collapsible>
        )}

        {/* 添加变式题 */}
        {pageSource === QuestionPageSource.MyQuestion && (
          <Button size="sm" variant="outline" onClick={() => alert('怎么考虑导航')}>
            添加变式题
          </Button>
        )}

        {/* 复制题目 */}
        <Button
          variant={copied ? 'default' : 'outline'}
          size="sm"
          title="复制 Markdown 格式的题干和答案, 数学公式语法为 LaTeX（行内 $...$、块级 $$...$$）"
          onClick={handleCopyInfo}
        >
          {copied ? '已复制' : '复制'}
        </Button>

        {/* 我的题目草稿中编辑题目, 提交题目审核 */}
        {pageSource === QuestionPageSource.MyQuestion && baseInfoResp.status === QuestionStatus.Drafing && (
          <>
            <Button size="sm" variant="outline" onClick={() => alert('怎么考虑导航')}>
              编辑
            </Button>
            <Dialog open={openSubmitApprove} onOpenChange={setOpenSubmitApprove}>
              <DialogTrigger
                render={
                  <Button size="sm" variant="outline">
                    提交审核
                  </Button>
                }
              />
              <DialogContent className="w-200! max-w-[90vw]! flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold">提交审核</DialogTitle>
                  <DialogDescription>请确认题目没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
                </DialogHeader>

                <Separator />

                <div className="space-y-3 px-4">
                  <div className="font-semibold">检查步骤</div>
                  <div className="text-xs space-y-2">
                    <p>1. 题目不能是抄袭的, 避免投诉和版权纠纷</p>
                    <p>2. 题目本身信息要完整</p>
                    <p>3. 图片等信息不能缺失</p>
                    <p>4. 题目和答案本身要符合常识</p>
                  </div>
                </div>

                <Separator />

                <DialogFooter>
                  <DialogClose render={<Button variant="outline">关闭</Button>} />
                  <Button onClick={handleSubmitApprove} disabled={submitApproving}>
                    {submitApproving ? '提交审核中' : '提交审核'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
              <DialogTrigger
                render={
                  <Button size="sm" variant="destructive">
                    删除
                  </Button>
                }
              />
              <DialogContent className="w-auto! max-w-[90vw]! min-w-75">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold">删除题目</DialogTitle>
                  <DialogDescription>题目删除后不可恢复, 如果不确定, 可以保留等后续确认后再删除</DialogDescription>
                </DialogHeader>

                <Separator />

                <DialogFooter>
                  <DialogClose render={<Button variant="outline">关闭</Button>} />
                  <Button onClick={handleDelete} disabled={deleting} variant="destructive">
                    {deleting ? '删除中' : '删除'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* 我的题目审核通过可以撤回草稿中即下线, 后续上线需要重新审核 */}
        {pageSource === QuestionPageSource.MyQuestion && baseInfoResp.status === QuestionStatus.Published && (
          <Button size="sm" variant="destructive" onClick={() => alert('撤回草稿')}>
            撤回草稿
          </Button>
        )}

        {/* 待审核的题目审核题目 */}
        {pageSource === QuestionPageSource.MyReview && baseInfoResp.status === QuestionStatus.Pending && (
          <Dialog open={openConfirmApprove} onOpenChange={setOpenConfirmApprove}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline">
                  审核
                </Button>
              }
            />
            <DialogContent className="w-200! max-w-[90vw]! flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">题目审核</DialogTitle>
                <DialogDescription>请确认题目没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="space-y-3 px-4">
                <div className="font-semibold">检查步骤</div>
                <div className="text-xs space-y-2">
                  <p>1. 题目不能是抄袭的, 避免投诉和版权纠纷</p>
                  <p>2. 题目本身信息要完整</p>
                  <p>3. 图片等信息不能缺失</p>
                  <p>4. 题目和答案本身要符合常识</p>
                  <p className="text-red-500 font-bold">5. 若你审核通过的题目后续被投诉等纠纷较多, 我们有权利降低你的账号等级</p>
                </div>
              </div>

              <Separator />

              <div className="flex-1 overflow-y-auto px-4 space-y-3">
                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                  <span className="text-xs font-semibold text-right">审核状态:</span>
                  <StatusSelect defaultValue={approveReq.status} onSelect={(val) => updateApproveReq('status', val)} />

                  <span className="text-xs font-semibold text-right">拒绝理由:</span>
                  <Textarea
                    value={approveReq.rejectReason}
                    onChange={(e) => updateApproveReq('rejectReason', e.target.value)}
                    placeholder="拒绝时需要说明拒绝原因"
                  />
                </div>
              </div>

              <Separator />

              <DialogFooter>
                <DialogClose render={<Button variant="outline">关闭</Button>} />
                <Button onClick={handleApprove} disabled={confirmApproving}>
                  {confirmApproving ? '审核中' : '审核'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* 变式题列表内容 */}
      <Collapsible open={isSimilarOpen}>
        <CollapsibleContent className="transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down pb-3">
          {viewSimilarErr || <SimilarListShow otherDictListRecord={otherDictListRecord} listResp={similarListResp} />}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export { QuestionOperateList };
