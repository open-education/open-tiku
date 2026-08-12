import { Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ChapterDropdownNav } from "~/common/nav";
import type { Textbook } from "~/type/textbook";
import { StatusSelect, TagSelect } from "~/common/paper/tag";
import { StringConst } from "~/util/string";
import { YearSelect } from "~/common/paper/year";
import { GradeSelect } from "~/common/paper/grade";
import { SemesterSelect } from "~/common/paper/semester";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import type { CommonPaperSearchReq, CommonPaperReq } from "~/type/paper";
import { Button } from "~/components/ui/button";

// 试卷基本信息搜索

interface CommonPaperSearchConfProps {
  textbooks: Textbook[];
  search: CommonPaperSearchReq;
  updateCommonPaperSearchReq: (key: keyof CommonPaperSearchReq, value: string | number | string[]) => void;
}

function CommonPaperSearchConf({ textbooks, search: metaSearch, updateCommonPaperSearchReq }: CommonPaperSearchConfProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">学段/考点:</div>
        <div className="flex-1 min-w-0">
          <ChapterDropdownNav
            textbooks={textbooks}
            onSelect={(selectedItems: Textbook[]) => {
              if (!selectedItems) {
                updateCommonPaperSearchReq("relatedId", 0);
                updateCommonPaperSearchReq("relatedName", "");
                updateCommonPaperSearchReq("selectedKeys", []);
                return;
              }

              const current: Textbook = selectedItems[selectedItems.length - 1];
              updateCommonPaperSearchReq("relatedId", current.id);
              updateCommonPaperSearchReq("relatedName", current.label);
              updateCommonPaperSearchReq(
                "selectedKeys",
                selectedItems.map((item) => item.key),
              );
            }}
            defaultSelectedKeys={metaSearch.selectedKeys}
            placeholder="请选择学段"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">标签:</div>
        <div className="flex-1 min-w-0">
          <TagSelect
            options={StringConst.examTags}
            defaultValue={metaSearch.tag}
            onSelect={(value) => {
              updateCommonPaperSearchReq("tag", value);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">年份:</div>
        <div className="flex-1 min-w-0">
          <YearSelect value={metaSearch.year} onValueChange={(val) => updateCommonPaperSearchReq("year", val ?? "")} placeholder="选择年份" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">年级:</div>
        <div className="flex-1 min-w-0">
          <GradeSelect value={metaSearch.grade} onValueChange={(val) => updateCommonPaperSearchReq("grade", val ?? "")} placeholder="选择年级" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">学期:</div>
        <div className="flex-1 min-w-0">
          <SemesterSelect
            value={metaSearch.semester}
            onValueChange={(val) => updateCommonPaperSearchReq("semester", val ?? "")}
            placeholder="选择学期"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">试卷类型:</div>
        <div className="flex-1 min-w-0 flex flex-wrap gap-4">
          {StringConst.paperTypes.map(({ value, label }) => (
            <Button
              key={value}
              className="text-sm md:text-sm w-20 text-center"
              type="button"
              variant={metaSearch.paperType === value ? "default" : "outline"}
              onClick={() => updateCommonPaperSearchReq("paperType", value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* 我的题目和审核可以自己选择状态 */}
      {metaSearch.source !== "list" && (
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">状态:</div>
          <div className="flex-1 min-w-0">
            <StatusSelect defaultValue={metaSearch.status} onSelect={(status) => updateCommonPaperSearchReq("status", status)} />
          </div>
        </div>
      )}
    </>
  );
}

// 试卷基础配置

interface CommonPaperConfProps {
  textbooks: Textbook[];
  commonPaperReq: CommonPaperReq;
  defaultSelectedKeys: string[];
  updateCommonPaperReq: (key: keyof CommonPaperReq, value: string | number) => void;
}
function CommonPaperConf({ textbooks = [], commonPaperReq, defaultSelectedKeys = [], updateCommonPaperReq }: CommonPaperConfProps) {
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
                    updateCommonPaperReq("relatedId", 0);
                    updateCommonPaperReq("relatedName", "");
                    return;
                  }
                  const current = selectedItems[selectedItems.length - 1];
                  updateCommonPaperReq("relatedId", current.id);
                  updateCommonPaperReq("relatedName", current.label);
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
                defaultValue={commonPaperReq.tag ?? ""}
                onSelect={(val) => {
                  updateCommonPaperReq("tag", val);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">年份:</div>
            <div className="col-span-8">
              <YearSelect
                value={commonPaperReq.year ?? ""}
                onValueChange={(val) => {
                  updateCommonPaperReq("year", val ?? "");
                }}
                placeholder="选择年份"
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">年级:</div>
            <div className="col-span-8">
              <GradeSelect
                value={commonPaperReq.grade ?? ""}
                onValueChange={(val) => updateCommonPaperReq("grade", !val || val === "不选" ? "" : val)}
                placeholder="选择年级"
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">学期:</div>
            <div className="col-span-8">
              <SemesterSelect
                value={commonPaperReq.semester ?? ""}
                onValueChange={(val) => updateCommonPaperReq("semester", !val || val === "不选" ? "" : val)}
                placeholder="选择学期"
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">标题:</div>
            <div className="col-span-8">
              <Textarea
                value={commonPaperReq.title}
                className="text-sm md:text-sm"
                onChange={(e) => updateCommonPaperReq("title", e.target.value)}
                placeholder={"请输入试卷标题"}
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">分数:</div>
            <div className="col-span-8">
              <Input
                type="number"
                value={commonPaperReq.score}
                onChange={(e) => {
                  updateCommonPaperReq("score", Number(e.target.value));
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
                value={commonPaperReq.source}
                onChange={(e) => updateCommonPaperReq("source", e.target.value)}
                placeholder={"请输入试卷来源"}
              />
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1 items-center">
            <div className="col-span-2">备注:</div>
            <div className="col-span-8">
              <Textarea
                value={commonPaperReq.remark}
                className="texst-sm md:text-sm"
                onChange={(e) => updateCommonPaperReq("remark", e.target.value)}
                placeholder={"请输入备注信息"}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { CommonPaperSearchConf, CommonPaperConf };
