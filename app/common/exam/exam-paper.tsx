import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import type { PaperMeta } from "~/type/exam";
import { StringConstUtil } from "~/util/string";

// 试卷列表样式展示
interface ExamPaperProps {
  papers: PaperMeta[];
}

function ExamPaper(props: ExamPaperProps) {
  const { papers } = props;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {papers.map((paper) => (
        <Card key={paper.title} className="group flex flex-col cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-150">
          <CardContent className="px-4 py-3.5 flex flex-col h-full">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <Badge className={cn("text-[10px] font-medium", StringConstUtil.getExamTagClass(paper.tag))}>{paper.tag}</Badge>
              {paper.year && <span className="text-[10px] text-muted-foreground shrink-0">{paper.year}</span>}
            </div>
            <p className="text-[13px] font-medium leading-snug mb-auto line-clamp-2 group-hover:text-primary transition-colors">{paper.title}</p>
            <Separator className="mt-3 mb-2.5" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{paper.grade}</span>
              <span className="text-[11px] text-muted-foreground">{paper.count} 题</span>
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
          <span className="text-sm font-medium">精选试卷</span>
        </div>
        <Badge variant="outline" className="text-[10px] font-normal">
          中高考 · 期末月考 · 名校特供
        </Badge>
      </div>
      <Button variant="link" size="sm">
        <a href="#" className="flex items-center gap-1 text-xs">
          全部试卷 <ArrowRight size={11} />
        </a>
      </Button>
    </div>
  );
}

export { ExamPaper };
