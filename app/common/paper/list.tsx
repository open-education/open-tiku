import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { cn } from '~/lib/utils';
import type { CommonPaperSearchReq, CommonPaperResp, TopPaperResp, GenPaperResp } from '~/type/paper';
import { StringConst, StringConstUtil } from '~/util/string';
import { httpClient } from '~/util/http';
import { TopInfo } from '~/home/paper/top/info';
import { GenInfoPreview } from '~/home/paper/gen/info';
import React from 'react';
import { SimpleAlert } from '~/common/alert';
import type { TextbookOtherDict } from '~/type/textbook';

/// 试卷元数据

// 试卷列表样式展示
interface PaperListProps {
  papers: CommonPaperResp[];
  search?: CommonPaperSearchReq;

  // 精选试卷不需要该部分信息
  questionTypeDict?: Record<number, TextbookOtherDict>;
  questionTagDict?: Record<number, TextbookOtherDict>;
  questionDimensionDict?: Record<number, TextbookOtherDict>;

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;

  // 提示加载中
  setLoading?: (value: boolean) => void;
  setWarnInfo?: (value: React.ReactNode) => void;
}

function PaperList({
  papers,
  search,
  questionTypeDict = {},
  questionTagDict = {},
  questionDimensionDict = {},
  setOpenSheet,
  setSheetTitle,
  setSheetDesc,
  setSheetContent,
  setLoading,
  setWarnInfo,
}: PaperListProps) {
  // 点击卡片展示详情
  const handleClickCard = (paperType: number, id: number) => {
    setLoading?.(true);
    setWarnInfo?.(null);

    if (paperType === StringConst.paperTypesGen) {
      httpClient
        .get<GenPaperResp>(`/paper/gen/info/${id}`)
        .then((res) => {
          setSheetTitle('查看详情');
          setSheetDesc('该处仅能查看明细, 如需修改请去 我的试卷 修改');
          setSheetContent(
            <GenInfoPreview
              infoResp={res}
              questionTypeDict={questionTypeDict}
              questionTagDict={questionTagDict}
              questionDimensionDict={questionDimensionDict}
            />,
          );
          setOpenSheet(true);
        })
        .catch((err) => {
          setWarnInfo?.(<SimpleAlert title="手动组卷详情查询失败" message={err.message} />);
        })
        .finally(() => {
          setLoading?.(false);
        });
    } else {
      httpClient
        .get<TopPaperResp>(`/paper/top/info/${id}`)
        .then((res) => {
          setSheetTitle('查看详情');
          setSheetDesc('如需修改直接编辑即可');
          setSheetContent(
            <TopInfo infoResp={res} search={search} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />,
          );
          setOpenSheet(true);
        })
        .catch((err) => {
          setWarnInfo?.(<SimpleAlert title="精选试卷详情查询失败" message={err.message} />);
        })
        .finally(() => {
          setLoading?.(false);
        });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {papers.map((paper) => (
        <Card
          key={paper.id}
          className="group flex flex-col cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-150"
          onClick={() => {
            handleClickCard(paper.paperType, paper.id || 0);
          }}
        >
          <PaperInfo commonResp={paper} />
        </Card>
      ))}
    </div>
  );
}

// 试卷详情
interface PaperInfoProps {
  commonResp: CommonPaperResp;
}

function PaperInfo({ commonResp }: PaperInfoProps) {
  return (
    <CardContent className="px-4 py-3.5 flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 mb-2.5 text-sm">
        <Badge className={cn('text-sm', StringConstUtil.getExamTagClass(commonResp.tag))}>{commonResp.tag}</Badge>
        {commonResp.year && <Badge className="text-sm bg-sky-50 text-sky-700 border-sky-100">{commonResp.year}</Badge>}
        {commonResp.grade && <Badge className="text-sm bg-sky-50 text-sky-700 border-sky-100">{commonResp.grade}</Badge>}
        {commonResp.semester && <Badge className="text-sm bg-sky-50 text-sky-700 border-sky-100">{commonResp.semester}</Badge>}
      </div>
      <p className="text-base leading-snug mb-auto line-clamp-2 group-hover:text-primary transition-colors">{commonResp.title}</p>
      <Separator className="mt-3 mb-2.5" />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{commonResp.authorName}</span>
        <span className="text-muted-foreground">{commonResp.createdAt}</span>
        <span className="text-muted-foreground">{commonResp.count} 题</span>
      </div>
    </CardContent>
  );
}

export { PaperList, PaperInfo };
