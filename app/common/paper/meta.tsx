import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import type { PaperMeta, PaperMetaSearch } from "~/type/paper";
import { StringConst, StringConstUtil } from "~/util/string";
import { TagShow } from "~/common/paper/tag";
import { ExamQuestion } from "~/common/paper/question";
import { httpClient } from "~/util/http";
import { toast } from "sonner";
import { NavLink } from "react-router";
import Add from "~/paper/add";
import { Button } from "~/components/ui/button";

/// 试卷元数据

// 试卷列表样式展示
interface ExamPaperProps {
  papers: PaperMeta[];
  metaSearch?: PaperMetaSearch;

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;

  // 提示加载中
  setLoading?: (value: boolean) => void;
}

function ExamPaper({ papers, metaSearch, setOpenSheet, setSheetTitle, setSheetDesc, setSheetContent, setLoading }: ExamPaperProps) {
  // 点击卡片展示详情
  const handleClickCard = (id: number) => {
    setLoading?.(true);

    httpClient
      .get<PaperMeta>(`/paper/info/${id}`)
      .then((res) => {
        // 查询成功后加载右侧 Sheet 详情信息
        setSheetTitle("查看详情");
        setSheetDesc("如需修改直接编辑即可");
        setSheetContent(
          <ExamPaperMeta
            paperMeta={res}
            metaSearch={metaSearch}
            setSheetTitle={setSheetTitle}
            setSheetDesc={setSheetDesc}
            setSheetContent={setSheetContent}
          />,
        );
        setOpenSheet(true);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">{err.message}</div>);
      })
      .finally(() => {
        setLoading?.(false);
      });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {papers.map((paper) => (
        <Card
          key={paper.id}
          className="group flex flex-col cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-150"
          onClick={() => {
            handleClickCard(paper.id || 0);
          }}
        >
          <CardContent className="px-4 py-3.5 flex flex-col h-full">
            <div className="flex items-start justify-between gap-2 mb-2.5 text-sm">
              <Badge className={cn("text-sm", StringConstUtil.getExamTagClass(paper.tag))}>{paper.tag}</Badge>
              {paper.year && <span className="text-muted-foreground shrink-0">{paper.year}</span>}
              {paper.grade && <span className="text-muted-foreground">{paper.grade}</span>}
              {paper.semester && <span className="text-muted-foreground">{paper.semester}</span>}
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
function ExamPaperHeader() {
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

// 试卷详情样式
interface ExamPaperMetaProps {
  paperMeta: PaperMeta;
  metaSearch?: PaperMetaSearch;
  isPreview?: boolean;

  // 以下为 Sheet 操作方法和属性
  setSheetTitle?: (value: string) => void;
  setSheetDesc?: (value: string) => void;
  setSheetContent?: (value: React.ReactNode) => void;
}
function ExamPaperMeta({
  paperMeta,
  metaSearch = {
    relatedId: 0,
    relatedName: "",
    selectedKeys: [],
    tag: "",
    year: "",
    grade: "",
    semester: "",
  },
  isPreview = false,
  setSheetTitle,
  setSheetDesc,
  setSheetContent,
}: ExamPaperMetaProps) {
  // 生成题型样式
  const getGroupName = (index: number, typeName: string, subTitle: string) => {
    const groupName = subTitle
      ? `${StringConst.groupNumberMap[index]}、${typeName} (${subTitle})`
      : `${StringConst.groupNumberMap[index]}、${typeName}`;
    return <div className="text-base">{groupName}</div>;
  };

  const handleEdit = () => {
    setSheetTitle?.("编辑试卷");
    setSheetDesc?.("当前为编辑试卷模式, 提交后会覆盖历史数据, 请谨慎操作");
    setSheetContent?.(
      <Add
        metaSearch={metaSearch}
        infoResp={paperMeta}
        setSheetTitle={setSheetTitle}
        setSheetDesc={setSheetDesc}
        setSheetContent={setSheetContent}
      />,
    );
  };

  return (
    <div className="flex flex-col gap-3 pl-4 pb-4 pr-4 bg-gray-100">
      {/* 编辑模式查看详情时才有 */}
      {!isPreview && (
        <>
          <div>
            <Separator />
          </div>

          <div>
            <Button variant="outline" className="text-sm" onClick={handleEdit}>
              编辑
            </Button>
          </div>
        </>
      )}

      <div>
        <Separator />
      </div>

      {/* 来源和备注, 只展示存在的信息 */}
      <div className="flex flex-col gap-1 text-sm">
        {paperMeta.score > 0 && <div>分数: {paperMeta.score}</div>}
        {paperMeta.authorName && (
          <div>
            由 <span className="text-sm font-medium text-blue-600">{paperMeta.authorName}</span> 上传
          </div>
        )}
        {paperMeta.source && <div>来源: {paperMeta.source}</div>}
        {paperMeta.remark && <div>备注: {paperMeta.remark}</div>}
      </div>

      <div>
        <Separator />
      </div>

      {/* 生成标签 */}
      <div className="flex gap-3 items-center w-full">
        <TagShow
          relatedName={paperMeta.relatedName ?? ""}
          tag={paperMeta.tag}
          year={paperMeta.year}
          grade={paperMeta.grade ?? ""}
          semester={paperMeta.semester ?? ""}
        />
      </div>

      {/* 标题 */}
      <div className="text-lg font-bold text-center">{paperMeta.title}</div>

      {/* 试卷内容 */}
      {paperMeta.groups?.map((group, idx) => {
        return (
          <div key={`${paperMeta.id}-${group.id}`}>
            {/* 题型名称 */}
            <div className="mt-2.5 mb-2.5 font-bold">{getGroupName(idx, group.typeName, group.subTitle)}</div>

            {/* 小题列表 */}
            {group.questions?.map((question, idx) => {
              return <ExamQuestion key={question.genId} index={idx} question={question} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

export { ExamPaper, ExamPaperHeader, ExamPaperMeta };
