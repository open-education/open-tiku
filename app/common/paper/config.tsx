import { Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ChapterDropdownNav } from "~/common/nav";
import type { Textbook } from "~/type/textbook";
import { TagSelect } from "~/common/paper/tag";
import { StringConst } from "~/util/string";
import { YearSelect } from "~/common/paper/year";
import { GradeSelect } from "~/common/paper/grade";
import { SemesterSelect } from "~/common/paper/semester";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import type { PaperMeta } from "~/type/paper";

// 试卷基础配置

interface PaperMetaConfProps {
  textbooks: Textbook[];
  paper: PaperMeta;
  defaultSelectedKeys: string[];
  updatePaperMeta: (key: keyof PaperMeta, value: string | number) => void;
}
function PaperMetaConf({ textbooks = [], paper, defaultSelectedKeys = [], updatePaperMeta }: PaperMetaConfProps) {
  return (
    <Card className="mt-1 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          <CardTitle className="text-base font-medium">基础设置</CardTitle>
        </div>
        <CardDescription className="text-sm">配置试卷标签, 年份，年级，学期，标题和分数等项</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="flex flex-col gap-3 text-sm">
          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">学段/考点:</div>
            <div className="col-span-8">
              <ChapterDropdownNav
                textbooks={textbooks}
                onSelect={(selectedItems: Textbook[]) => {
                  // 直接记录末级的标识即可, 搜索直接搜索该层级标识即可, 不关心父级和子级
                  // 但是详情和编辑需要展示这个路径, 需要用了再获取
                  if (!selectedItems) {
                    updatePaperMeta("relatedId", 0);
                    updatePaperMeta("relatedName", "");
                    return;
                  }
                  const current = selectedItems[selectedItems.length - 1];
                  updatePaperMeta("relatedId", current.id);
                  updatePaperMeta("relatedName", current.label);
                }}
                defaultSelectedKeys={defaultSelectedKeys}
                placeholder="请选择学段"
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">标签:</div>
            <div className="col-span-8">
              <TagSelect
                options={StringConst.examTags}
                defaultValue={paper.tag ?? ""}
                onSelect={(val) => {
                  updatePaperMeta("tag", val);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">年份:</div>
            <div className="col-span-8">
              <YearSelect
                value={paper.year ?? ""}
                onValueChange={(val) => {
                  updatePaperMeta("year", val ?? "");
                }}
                placeholder="选择年份"
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">年级:</div>
            <div className="col-span-8">
              <GradeSelect
                value={paper.grade ?? ""}
                onValueChange={(val) => updatePaperMeta("grade", !val || val === "不选" ? "" : val)}
                placeholder="选择年级"
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">学期:</div>
            <div className="col-span-8">
              <SemesterSelect
                value={paper.semester ?? ""}
                onValueChange={(val) => updatePaperMeta("semester", !val || val === "不选" ? "" : val)}
                placeholder="选择学期"
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">标题:</div>
            <div className="col-span-8">
              <Textarea
                value={paper.title}
                className="text-sm md:text-sm"
                onChange={(e) => updatePaperMeta("title", e.target.value)}
                placeholder={"请输入试卷标题"}
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">分数:</div>
            <div className="col-span-8">
              <Input
                type="number"
                value={paper.score}
                onChange={(e) => {
                  updatePaperMeta("score", Number(e.target.value));
                }}
                className="text-sm md:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">来源:</div>
            <div className="col-span-8">
              <Textarea
                className="text-sm md:text-sm"
                value={paper.source}
                onChange={(e) => updatePaperMeta("source", e.target.value)}
                placeholder={"请输入试卷来源"}
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">备注:</div>
            <div className="col-span-8">
              <Textarea
                value={paper.remark}
                className="texst-sm md:text-sm"
                onChange={(e) => updatePaperMeta("remark", e.target.value)}
                placeholder={"请输入备注信息"}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { PaperMetaConf };
