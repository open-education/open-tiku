import { SimpleAlert } from '@/components/common/alert';
import { ListSelect } from '@/components/common/list';
import { SimpleTooltip } from '@/components/common/tooltip';
import { AnswerInfo } from '@/components/question/info';
import { SimilarListShow } from '@/components/question/list';
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
import { QuestionPageSource, QuestionRelationType, QuestionStatus, ReportType } from '@/type/enum';
import type {
  CountQuestionResp,
  QuestionApproveReq,
  QuestionBaseInfoResp,
  QuestionDeleteReq,
  QuestionInfoResp,
  QuestionListResp,
  QuestionPendingReq,
  QuestionSimilarListReq,
  QuestionUndoReq,
} from '@/type/question';
import type { OtherDictListRecord } from '@/type/textbook';
import { httpClient } from '@/util/http';
import { StringConst } from '@/util/string';
import React, { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import type { KeyedMutator } from 'swr';

// 题目操作列表
interface QuestionOperateListProps {
  pageSource: QuestionPageSource;
  otherDictListRecord: OtherDictListRecord;
  baseInfoResp: QuestionBaseInfoResp;
  questionListRespMutate: KeyedMutator<QuestionListResp>; // 审核删除等操作需要重置列表接口重新请求数据
  countListRespMutate?: KeyedMutator<CountQuestionResp[]>; // 我的题目提交审核等操作需要重置列表状态计数接口重新请求数据
}

function QuestionOperateList({
  pageSource,
  otherDictListRecord,
  baseInfoResp,
  questionListRespMutate,
  countListRespMutate,
}: QuestionOperateListProps) {
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
      source: pageSource,
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
          action: {
            label: '关闭',
            onClick: () => {},
          },
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

    await copy(fullMd);
  };

  // 提交审核
  const [openSubmitApprove, setOpenSubmitApprove] = useState<boolean>(false);
  const [submitApproving, setSubmitApproving] = useState<boolean>(false);

  const handleSubmitApprove = () => {
    setSubmitApproving(true);

    const req: QuestionPendingReq = {
      id: baseInfoResp.id,
    };
    httpClient
      .post('/question/pending', req)
      .then((_) => {
        questionListRespMutate().then((_) => {});
        countListRespMutate?.();
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
      .then((_) => {
        questionListRespMutate().then((_) => {});
        countListRespMutate?.();
        setOpenDelete(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">删除题目出错: {err.message}</div>);
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  // 退回题目到草稿中
  const [openUndo, setOpenUndo] = useState<boolean>(false);
  const [undoing, setUndoing] = useState<boolean>(false);

  const handleUndo = () => {
    setUndoing(true);

    const req: QuestionUndoReq = {
      id: baseInfoResp.id,
    };

    httpClient
      .post('/question/undo', req)
      .then((_) => {
        questionListRespMutate().then((_) => {});
        countListRespMutate?.();
        setOpenUndo(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">退回题目出错: {err.message}</div>);
      })
      .finally(() => {
        setUndoing(false);
      });
  };

  // 审核题目
  const [openConfirmApprove, setOpenConfirmApprove] = useState<boolean>(false);
  const [confirmApproving, setConfirmApproving] = useState<boolean>(false);

  const [approveReq, setApproveReq] = useState<QuestionApproveReq>({
    id: baseInfoResp.id,
    status: QuestionStatus.Drafting,
    rejectReason: '',
  });
  const updateApproveReq = (key: keyof QuestionApproveReq, value: number | string) => {
    setApproveReq((prev) => ({ ...prev, [key]: value }));
  };

  const handleApprove = () => {
    setConfirmApproving(true);

    httpClient
      .post('/edit/question/status', approveReq)
      .then((_) => {
        questionListRespMutate().then((_) => {});
        countListRespMutate?.();
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
        <CollapsibleContent className="transition-all data-[state=open]:animate-collapsible-down mt-3 p-3 bg-secondary border border-dotted border-blue-100">
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
        {pageSource === QuestionPageSource.MyQuestion && baseInfoResp.relationType === QuestionRelationType.Base && (
          <Button size="sm" variant="outline">
            <Link to={`/ops/my/question/edit?id=${baseInfoResp.id}&type=2`} target="_blank">
              添加变式题
            </Link>
          </Button>
        )}

        {/* 复制题目 */}
        <Button
          variant={copied ? 'default' : 'outline'}
          size="sm"
          title="复制 Markdown 格式的题干和答案, 数学公式语法为 KaTeX（行内 $...$、块级 $$...$$）"
          onClick={handleCopyInfo}
        >
          {copied ? '已复制' : '复制'}
        </Button>

        {/* 我的题目草稿中编辑题目, 提交题目审核 */}
        {pageSource === QuestionPageSource.MyQuestion &&
          (baseInfoResp.status === QuestionStatus.Drafting || baseInfoResp.status === QuestionStatus.Rejected) && (
            <>
              <Button size="sm" variant="outline">
                <Link to={`/ops/my/question/edit?id=${baseInfoResp.id}&type=1`} target="_blank">
                  编辑
                </Link>
              </Button>

              {baseInfoResp.status === QuestionStatus.Drafting && (
                <Dialog open={openSubmitApprove} onOpenChange={setOpenSubmitApprove}>
                  <DialogTrigger
                    render={
                      <Button size="sm" variant="outline">
                        提交审核
                      </Button>
                    }
                  />
                  <DialogContent className="w-150! max-w-[95vw]! flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="text-sm font-bold">提交审核</DialogTitle>
                      <DialogDescription>请确认题目没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
                    </DialogHeader>

                    <Separator />

                    <div className="space-y-3 px-4">
                      <div className="text-sm">检查步骤</div>
                      <div className="text-xs space-y-2 leading-relaxed">
                        <p>1. 确保题目为原创或已获授权，严禁搬运抄袭，避免版权纠纷。</p>
                        <p>2. 题干、选项、解析信息完整，无错别字或语句歧义。</p>
                        <p>3. 确认所有配图清晰、公式渲染正常，无失效链接或第三方平台水印。</p>
                        <p>4. 答案与解析准确无误，符合事实、常识及现行教学大纲。</p>
                        <p>5. 学科、年级、知识点及难度标签标注准确，不含任何广告导流信息。</p>
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
              )}

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
          <Dialog open={openUndo} onOpenChange={setOpenUndo}>
            <DialogTrigger
              render={
                <Button size="sm" variant="destructive">
                  退回草稿
                </Button>
              }
            />
            <DialogContent className="w-auto! max-w-[90vw]! min-w-75">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">退回草稿</DialogTitle>
                <DialogDescription>题目发布后发现错误或需要更新， 可退回草稿重新编辑后再次提交进入审核流程</DialogDescription>
              </DialogHeader>

              <Separator />

              <DialogFooter>
                <DialogClose render={<Button variant="outline">关闭</Button>} />
                <Button onClick={handleUndo} disabled={undoing} variant="destructive">
                  {undoing ? '退回草稿中' : '退回草稿'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* 待审核的题目审核题目 */}
        {pageSource === QuestionPageSource.MyReview && baseInfoResp.status === QuestionStatus.Pending && (
          <Dialog open={openConfirmApprove} onOpenChange={setOpenConfirmApprove}>
            <DialogTrigger
              render={
                <Button size="sm" variant="destructive">
                  审核
                </Button>
              }
            />
            <DialogContent className="w-150! max-w-[95vw]! flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">题目审核</DialogTitle>
                <DialogDescription>请确认题目没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="space-y-3 px-4">
                <div className="space-y-2">
                  <div className="text-sm">审核检查步骤</div>
                  <div className="text-xs space-y-2 leading-relaxed">
                    <p>1. 核查版权合规性，确认非明显抄袭且无其他平台水印或广告导流。</p>
                    <p>2. 检查内容完整性，确认题干、选项、图片、公式无缺失或乱码。</p>
                    <p>3. 校验答案与解析准确性，确保符合常识与事实，无明显逻辑或计算错误。</p>
                    <p>4. 确认科目、学段、知识点及难度标签匹配合理。</p>
                    <p className="text-destructive font-semibold">
                      5. 若你审核通过的内容后续被多次投诉或引发版权纠纷，平台有权降低你的账号等级或取消审核资格。
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex-1 overflow-y-auto px-4 space-y-3">
                <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                  <span className="text-xs font-semibold text-right">审核状态:</span>
                  <ListSelect
                    options={StringConst.questionStatusList}
                    defaultValue={approveReq.status}
                    onSelect={(val) => updateApproveReq('status', val)}
                  />

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

        {/* 拒绝理由 */}
        {baseInfoResp.status === QuestionStatus.Rejected && (
          <SimpleTooltip
            tip={
              <Button size="sm" variant="destructive">
                已拒绝
              </Button>
            }
            content={baseInfoResp.rejectReason}
          />
        )}

        {/* 已发布投诉 */}
        {pageSource === QuestionPageSource.List && baseInfoResp.status === QuestionStatus.Published && (
          <Link to={`/report?id=${baseInfoResp.id}&type=${ReportType.Question}`} target="_blank">
            <Button size="sm" variant="destructive">
              投诉
            </Button>
          </Link>
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
