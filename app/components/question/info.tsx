import { SimpleAlert } from '@/components/common/alert';
import { SimpleFullContent } from '@/components/common/content';
import { SimilarListShow } from '@/components/question/list';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCopy } from '@/hooks/use-copy';
import { QuestionPageSource, QuestionRelationType } from '@/type/enum';
import type { QuestionBaseInfoResp, QuestionInfoResp, QuestionListResp, QuestionSimilarListReq } from '@/type/question';
import type { OtherDictListRecord } from '@/type/textbook';
import { httpClient } from '@/util/http';
import React, { useState } from 'react';
import { toast } from 'sonner';

// 答案解析
interface AnswerInfoProps {
  infoResp: QuestionInfoResp | null;
}
function AnswerInfo({ infoResp }: AnswerInfoProps) {
  if (infoResp === null) {
    return <SimpleAlert title="查询答案解析为空" message="题目未维护答案信息" variant="default" />;
  }

  // 有详情返回时优先详情返回, 否则理解为预览数据
  const { baseInfo, extraInfo } = infoResp;

  // 来源和备注, 只展示存在的信息
  const otherInfo = (
    <div className="text-xs flex flex-col gap-1 pt-1">
      <div>创建时间: {baseInfo.createdAt}</div>
      <div>作者昵称: {baseInfo.authorName || ''}</div>
      {baseInfo.originalName && <div>创作者昵称: {baseInfo.originalName}</div>}
      {baseInfo.source && <div>来源: {baseInfo.source}</div>}
      {baseInfo.approveName && <div>审核人: {baseInfo.approveName}</div>}
      {baseInfo.approveAt && <div>审核时间: {baseInfo.approveAt}</div>}
      <div>更新时间: {baseInfo.updatedAt}</div>
    </div>
  );

  // 特殊值
  const otherInfoId = 4;
  const sections = [
    { id: 1, title: '参考答案', content: extraInfo.answer || '未维护', color: 'text-emerald-600', dot: 'bg-emerald-500' },
    { id: 2, title: '解题分析', content: extraInfo.analysis?.content || '未维护', color: 'text-sky-600', dot: 'bg-sky-500' },
    { id: 3, title: '解题过程', content: extraInfo.process?.content || '未维护', color: 'text-violet-600', dot: 'bg-violet-500' },
    { id: otherInfoId, title: '其它信息', content: '', color: 'text-amber-600', dot: 'bg-amber-500' }, // id下面用了相等值修改时注意
  ];

  return (
    <div className="space-y-3 text-sm">
      {sections.map(({ id, title, content, color, dot }) => (
        <div key={id} className="space-y-1">
          <div className={`flex items-center gap-1.5 font-bold ${color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {title}
          </div>
          <div className="pl-3 text-slate-700">{id === otherInfoId ? otherInfo : <SimpleFullContent content={content} />}</div>
        </div>
      ))}
    </div>
  );
}

// 题目相亲信息
interface QuestionInfoProps {
  pageSource: QuestionPageSource;
  otherDictListRecord: OtherDictListRecord;
  baseInfoResp: QuestionBaseInfoResp;
}
function QuestionInfo({ pageSource, otherDictListRecord, baseInfoResp }: QuestionInfoProps) {
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
      `## 题干\n${baseInfoResp.title}`,
      titleImages.length > 0 ? titleImages.join('\n') : '',
      opt.length > 0 ? opt.join('\n') : '',
      `## 参考答案\n${detail.extraInfo.answer ?? ''}`,
      `## 解题分析\n${detail.extraInfo.analysis?.content ?? ''}`,
      `## 解题过程\n${detail.extraInfo.process?.content ?? ''}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    copy(fullMd);
  };

  return (
    <div className="w-full space-y-3">
      {/* 答案解析内容 */}
      <Collapsible open={isAnswerOpen}>
        <CollapsibleContent className="transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down mt-3 p-3 bg-muted border border-dotted border-blue-100">
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

        {/* 编辑题目 */}
        {pageSource === QuestionPageSource.MyQuestion && (
          <Button size="sm" variant="outline" onClick={() => alert('怎么考虑导航')}>
            编辑
          </Button>
        )}

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

export { AnswerInfo, QuestionInfo };
