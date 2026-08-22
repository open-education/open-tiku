import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { CommonPaperResp, CommonPaperSearchReq, GenPaperResp, PaperApproveReq, PaperDeleteReq, PaperListResp, TopPaperResp } from "~/type/paper";
import { PaperStatus } from "~/type/enum";
import { httpClient } from "~/util/http";
import { StringConst } from "~/util/string";
import { GenInfo, GenInfoPreview } from "~/paper/gen/info";
import { TopInfo } from "~/paper/top/info";
import React, { useState } from "react";
import { SimpleAlert } from "~/common/alert";
import type { TextbookOtherDict } from "~/type/textbook";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import type { KeyedMutator } from "swr";
import { StatusSelect } from "~/common/paper/tag";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { SimpleTooltip } from "~/common/tooltip";
import { ExportPdf } from "~/common/paper/print";
import { PublishHomework } from "~/paper/gen/homework";

// 试卷列表

interface MyPaperListProps {
  search: CommonPaperSearchReq;
  paperList: CommonPaperResp[];
  paperListRespMutate: KeyedMutator<PaperListResp>;

  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionDimensionDict: Record<number, TextbookOtherDict>;

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;

  setIsLoading: (value: boolean) => void;
}

function MyPaperList({
  search,
  paperList,
  paperListRespMutate,
  questionTypeDict,
  questionTagDict,
  questionDimensionDict,
  setOpenSheet,
  setSheetTitle,
  setSheetDesc,
  setSheetContent,
  setIsLoading,
}: MyPaperListProps) {
  const [warnInfo, setWarnInfo] = useState<React.ReactNode>(null);

  // 查看详情如果是精选试卷保留原有逻辑, 如果是手动组卷需要支持替换和重新排序题目
  const handlePaperInfo = (paperType: number, id: number, isExport: boolean) => {
    setWarnInfo("");

    if (paperType === StringConst.paperTypesGen) {
      httpClient
        .get<GenPaperResp>(`/paper/gen/info/${id}`)
        .then((res) => {
          // 我的试卷才有编辑功能
          if (isExport) {
            setSheetTitle("下载PDF文件");
            setSheetDesc("下载PDF文件预览样式, 没问题后确认下载即可");
            setSheetContent(<ExportPdf genInfoResp={res} />);
          } else {
            setSheetTitle("查看详情");
            if (res.common.status === PaperStatus.Drafing && search.source === "myPaper") {
              setSheetDesc("当前为可编辑状态");
              setSheetContent(
                <GenInfo
                  infoResp={res}
                  questionTypeDict={questionTypeDict}
                  questionTagDict={questionTagDict}
                  questionDimensionDict={questionDimensionDict}
                  setOpenSheet={setOpenSheet}
                />,
              );
            } else {
              setSheetDesc("当前为不可编辑状态");
              setSheetContent(
                <GenInfoPreview
                  infoResp={res}
                  questionTypeDict={questionTypeDict}
                  questionTagDict={questionTagDict}
                  questionDimensionDict={questionDimensionDict}
                />,
              );
            }
          }
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
          // 打印预览
          if (isExport) {
            setSheetTitle("下载PDF文件");
            setSheetDesc("下载PDF文件预览样式, 没问题后确认下载即可");
            setSheetContent(<ExportPdf topInfoResp={res} />);
          } else {
            setSheetTitle("查看详情");
            setSheetDesc("如需修改直接编辑即可");
            setSheetContent(
              <TopInfo infoResp={res} search={search} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />,
            );
          }
          setOpenSheet(true);
        })
        .catch((err) => {
          setWarnInfo(<SimpleAlert title="精选试卷详情查询失败" message={err.message} />);
        })
        .finally(() => {});
    }
  };

  // 提交审核
  const [openSubmitApprove, setOpenSubmitApprove] = useState<boolean>(false);
  const [submitApproving, setSubmitApproving] = useState<boolean>(false);

  const handleSubmitApprove = (paperId: number) => {
    setIsLoading(true);

    setSubmitApproving(true);

    const req: PaperApproveReq = {
      id: paperId,
      status: PaperStatus.Pending,
      rejectReason: "",
    };
    httpClient
      .post("/edit/paper/status", req)
      .then((res) => {
        paperListRespMutate();
        setOpenSubmitApprove(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">审核操作出错: {err.message}</div>);
      })
      .finally(() => {
        setIsLoading(false);
        setSubmitApproving(false);
      });
  };

  // 审核
  const [openConfirmApprove, setOpenConfirmApprove] = useState<boolean>(false);
  const [confirmApproving, setConfirmApproving] = useState<boolean>(false);

  const defaultApproveReq: PaperApproveReq = { id: 0, status: PaperStatus.Drafing, rejectReason: "" };
  const [approveReq, setApproveReq] = useState<PaperApproveReq>(defaultApproveReq);

  const updateApproveReq = (key: keyof PaperApproveReq, value: number | string) => {
    setApproveReq((prev) => ({ ...prev, [key]: value }));
  };
  const handleApprove = (paperId: number) => {
    setIsLoading(true);

    setConfirmApproving(true);

    let req: PaperApproveReq = { ...approveReq, id: paperId };

    httpClient
      .post("/edit/paper/status", req)
      .then((res) => {
        paperListRespMutate();
        setOpenConfirmApprove(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">审核操作出错: {err.message}</div>);
      })
      .finally(() => {
        setIsLoading(false);
        setConfirmApproving(false);
        setApproveReq({ ...defaultApproveReq });
      });
  };

  // 删除
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDelete = (paperId: number) => {
    setIsLoading(true);
    setDeleting(true);

    const req: PaperDeleteReq = {
      id: paperId,
    };

    httpClient
      .post("/paper/delete", req)
      .then((res) => {
        paperListRespMutate();
        setOpenDelete(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">删除试卷出错: {err.message}</div>);
      })
      .finally(() => {
        setIsLoading(false);
        setDeleting(false);
      });
  };

  // 展示按钮区域
  const showOperateList = (info: CommonPaperResp) => {
    // 详情按钮-所有地方均有
    const buttons = [
      <Button key="myPaperInfo" variant="link" onClick={() => handlePaperInfo(info.paperType, info.id || 0, false)}>
        详情
      </Button>,
    ];

    if (search.source === "myPaper") {
      // 我的试卷
      if (info.status === PaperStatus.Drafing) {
        buttons.push(
          <Dialog key="myPaperSubmit" open={openSubmitApprove} onOpenChange={setOpenSubmitApprove}>
            <DialogTrigger render={<Button variant="link">提交审核</Button>} />
            <DialogContent className="w-auto! max-w-[90vw]! min-w-75">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">提交试卷审核</DialogTitle>
                <DialogDescription className="text-sm">请确认试卷没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button className="text-sm" onClick={() => handleSubmitApprove(info.id)} disabled={submitApproving}>
                  {submitApproving ? "提交审核中" : "提交审核"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>,
        );
        buttons.push(
          <Dialog key="myPaperDelete" open={openDelete} onOpenChange={setOpenDelete}>
            <DialogTrigger render={<Button variant="link">删除</Button>} />
            <DialogContent className="w-auto! max-w-[90vw]! min-w-75">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">删除试卷</DialogTitle>
                <DialogDescription>试卷删除后不可恢复, 如果不确定, 可以保留等后续确认后再删除</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button className="text-sm" onClick={() => handleDelete(info.id)} disabled={deleting}>
                  {deleting ? "删除中" : "删除"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>,
        );
      } else if (info.status === PaperStatus.Published) {
        // 手动组卷才需要布置作业
        if (info.paperType === StringConst.paperTypesGen) {
          buttons.push(
            <Button
              key="myPaperHomework"
              variant="link"
              onClick={() => {
                setSheetTitle("发布作业");
                setSheetDesc("作业只能布置到你管理的班级, 可以发布给任意班级, 或者任意班级内的任意学生");
                setSheetContent(<PublishHomework setOpenSheet={setOpenSheet} genInfoResp={info} />);
                setOpenSheet(true);
              }}
            >
              布置作业
            </Button>,
          );
        }
      }
    } else {
      // 我的审核
      if (info.status === PaperStatus.Pending) {
        buttons.push(
          <Dialog key="myPaperReviewApprove" open={openConfirmApprove} onOpenChange={setOpenConfirmApprove}>
            <DialogTrigger render={<Button variant="link">审核</Button>} />
            <DialogContent className="w-auto! max-w-[90vw]! min-w-75">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">试卷审核</DialogTitle>
                <DialogDescription className="text-sm">请确认试卷没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <div className="md:w-24 shrink-0 font-medium">审核状态:</div>
                  <div className="flex-1 min-w-0">
                    <StatusSelect defaultValue={approveReq.status} onSelect={(val) => updateApproveReq("status", val)} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <div className="md:w-24 shrink-0 font-medium">拒绝理由:</div>
                  <div className="flex-1 min-w-0">
                    <Textarea
                      value={approveReq.rejectReason}
                      className="text-sm md:text-sm"
                      onChange={(e) => updateApproveReq("rejectReason", e.target.value)}
                      placeholder="拒绝时需要说明拒绝原因"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                <Button className="text-sm" onClick={() => handleApprove(info.id)} disabled={confirmApproving}>
                  {confirmApproving ? "审核中" : "审核"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>,
        );
      }
    }

    // 始终可以打印不做控制
    buttons.push(
      <Button key="topInfoExportPdf" variant="link" onClick={() => handlePaperInfo(info.paperType, info.id || 0, true)}>
        下载
      </Button>,
    );

    return buttons;
  };

  return (
    <div>
      <div className="mt-3 mb-3">{warnInfo}</div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-semibold">标题</TableHead>
              <TableHead className="text-sm font-semibold">标签</TableHead>
              <TableHead className="text-sm font-semibold">年份</TableHead>
              <TableHead className="text-sm font-semibold">试卷类型</TableHead>
              <TableHead className="text-sm font-semibold">状态</TableHead>
              <TableHead className="text-sm font-semibold">作者</TableHead>
              <TableHead className="text-sm text-right font-semibold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paperList.map((info) => (
              <TableRow key={info.id}>
                <TableCell className="font-medium text-sm">
                  <SimpleTooltip children={info.title} />
                </TableCell>
                <TableCell className="text-sm">{info.tag}</TableCell>
                <TableCell className="text-sm">{info.year}</TableCell>
                <TableCell className="text-sm">{StringConst.paperTypeNames.get(info.paperType) || ""}</TableCell>
                <TableCell className="text-sm">{info.statusDesc}</TableCell>
                <TableCell className="text-sm">{info.authorName}</TableCell>
                <TableCell className="text-sm text-right">
                  <div className="flex justify-end">{showOperateList(info)}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export { MyPaperList };
