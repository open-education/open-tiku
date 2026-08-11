import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { CommonPaperResp, CommonPaperSearchReq, GenPaperResp, TopPaperResp } from "~/type/paper";
import { PaperStatus } from "~/util/enum";
import { httpClient } from "~/util/http";
import { StringConst } from "~/util/string";
import { GenInfo } from "~/paper/gen/info";
import { TopInfo } from "~/paper/top/info";
import React, { useState } from "react";
import { SimpleAlert } from "~/common/alert";

// 试卷列表

interface PaperGenListProps {
  search: CommonPaperSearchReq;
  paperList: CommonPaperResp[];

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;
}

function PaperGenList({ search, paperList, setOpenSheet, setSheetTitle, setSheetDesc, setSheetContent }: PaperGenListProps) {
  const [warnInfo, setWarnInfo] = useState<React.ReactNode>(null);

  // 查看详情如果是精选试卷保留原有逻辑, 如果是手动组卷需要支持替换和重新排序题目
  const handlePaperInfo = (paperType: number, id: number) => {
    if (paperType === StringConst.paperTypesGen) {
      httpClient
        .get<GenPaperResp>(`/paper/gen/info/${id}`)
        .then((res) => {
          setSheetTitle("查看详情");
          setSheetDesc("");
          setSheetContent(<GenInfo infoResp={res} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />);
          setOpenSheet(true);
        })
        .catch((err) => {
          setWarnInfo(<SimpleAlert title="手动组卷详情查询失败" message={err.message} />);
        })
        .finally(() => {});
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
          setWarnInfo(<SimpleAlert title="精选试卷详情查询失败" message={err.message} />);
        })
        .finally(() => {});
    }
  };

  return (
    <div>
      <div className="mt-3 mb-3">{warnInfo}</div>

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
    </div>
  );
}

export { PaperGenList };
