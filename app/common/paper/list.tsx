import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import type { CommonPaperSearchReq, CommonPaperResp, TopPaperResp, GenPaperResp } from "~/type/paper";
import { StringConst, StringConstUtil } from "~/util/string";
import { httpClient } from "~/util/http";
import { NavLink } from "react-router";
import { TopInfo } from "~/paper/top/info";
import { GenInfo } from "~/paper/gen/info";
import React from "react";
import { SimpleAlert } from "~/common/alert";
import type { TextbookOtherDict } from "~/type/textbook";

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
          setSheetTitle("查看详情");
          setSheetDesc("");
          setSheetContent(
            <GenInfo
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
          setSheetTitle("查看详情");
          setSheetDesc("如需修改直接编辑即可");
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
          <CardContent className="px-4 py-3.5 flex flex-col h-full">
            <div className="flex items-start justify-between gap-2 mb-2.5 text-sm">
              <Badge className={cn("text-sm", StringConstUtil.getExamTagClass(paper.tag))}>{paper.tag}</Badge>
              {paper.year && <Badge className="text-sm bg-sky-50 text-sky-700 border-sky-100">{paper.year}</Badge>}
              {paper.grade && <Badge className="text-sm bg-sky-50 text-sky-700 border-sky-100">{paper.grade}</Badge>}
              {paper.semester && <Badge className="text-sm bg-sky-50 text-sky-700 border-sky-100">{paper.semester}</Badge>}
            </div>
            <p className="text-base leading-snug mb-auto line-clamp-2 group-hover:text-primary transition-colors">{paper.title}</p>
            <Separator className="mt-3 mb-2.5" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{paper.authorName}</span>
              <span className="text-muted-foreground">{paper.createdAt}</span>
              <span className="text-muted-foreground">{paper.count} 题</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 首页试卷头
function PaperHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-muted-foreground" />
          <span className="">精选试卷</span>
        </div>
        <Badge variant="outline" className="font-normal">
          中高考 · 期末月考 · 名校特供
        </Badge>
      </div>
      <NavLink to={"/paper"}>
        <div className="flex items-center gap-1 text-xs">
          全部试卷 <ArrowRight size={11} />
        </div>
      </NavLink>
    </div>
  );
}

export { PaperList, PaperHeader };
