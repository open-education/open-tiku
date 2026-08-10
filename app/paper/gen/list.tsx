import { ExamPaperTopMeta } from "~/common/paper/meta";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { PaperMeta, PaperMetaSearch } from "~/type/paper";
import { PaperStatus } from "~/util/enum";
import { httpClient } from "~/util/http";
import { StringConst } from "~/util/string";
import { toast } from "sonner";
import { ExamPaperGenMeta } from "~/paper/gen/meta";

// 试卷列表

interface PaperGenListProps {
  metaSearch: PaperMetaSearch;
  paperList: PaperMeta[];

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;
}

function PaperGenList({ metaSearch, paperList, setOpenSheet, setSheetTitle, setSheetDesc, setSheetContent }: PaperGenListProps) {
  // 查看详情如果是精选试卷保留原有逻辑, 如果是手动组卷需要支持替换和重新排序题目
  const handlePaperInfo = (paperType: number, id: number) => {
    let reqUrl = `/paper/top/info/${id}`;
    if (paperType === StringConst.paperTypesGen) {
      reqUrl = `/paper/gen/info/${id}`;
    }

    httpClient
      .get<PaperMeta>(reqUrl)
      .then((res) => {
        // 查询成功后加载右侧 Sheet 详情信息
        setSheetTitle("查看详情");
        if (paperType === StringConst.paperTypeTop) {
          setSheetDesc("如需修改直接编辑即可");
          setSheetContent(
            <ExamPaperTopMeta
              paperMeta={res}
              metaSearch={metaSearch}
              setSheetTitle={setSheetTitle}
              setSheetDesc={setSheetDesc}
              setSheetContent={setSheetContent}
            />,
          );
        } else {
          setSheetDesc("");
          setSheetContent(
            <ExamPaperGenMeta initPaperMeta={res} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />,
          );
        }
        setOpenSheet(true);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">{err.message}</div>);
      })
      .finally(() => {});
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-sm">标题</TableHead>
            <TableHead className="text-sm">标签</TableHead>
            <TableHead className="text-sm">年份</TableHead>
            <TableHead className="text-sm">试卷类型</TableHead>
            <TableHead className="text-sm">状态</TableHead>
            <TableHead className="text-sm">作者</TableHead>
            <TableHead className="text-sm text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paperList.map((info) => (
            <TableRow key={info.id}>
              <TableCell className="font-medium text-sm">{info.title}</TableCell>
              <TableCell className="text-sm">{info.tag}</TableCell>
              <TableCell className="text-sm">{info.year}</TableCell>
              <TableCell className="text-sm">{StringConst.paperTypeNames.get(info.paperType) || ""}</TableCell>
              <TableCell className="text-sm">{info.statusDesc}</TableCell>
              <TableCell className="text-sm">{info.authorName}</TableCell>
              <TableCell className="text-sm text-right">
                <div className="flex justify-end">
                  <Button variant="link" onClick={() => handlePaperInfo(info.paperType, info.id || 0)}>
                    详情
                  </Button>
                  {info.status === PaperStatus.Drafing && <Button variant="link">提交审核</Button>}
                  {info.status === PaperStatus.Published && <Button variant="link">布置作业</Button>}
                  <Button variant="destructive">删除</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { PaperGenList };
