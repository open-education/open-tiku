import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { ApproveReq, DeleteReq, QuestionInfoResp, QuestionListResp, QuestionPageSourceProps, QuestionSearch } from "~/type/question";
import type { TextbookOtherDict } from "~/type/textbook";
import { httpClient } from "~/util/http";
import { QuestionInfo } from "~/common/question/info";
import { SimilarQuestionList } from "~/question/similar";
import Add from "~/question/add";
import { toast } from "sonner";
import { StringConst } from "~/util/string";
import { useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
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
import { QuestionStatus } from "~/util/enum";
import type { KeyedMutator } from "swr";

/// 题目题目相关标签选择器

interface TypeSelectProps {
  /** 标签选项数组 */
  options: TextbookOtherDict[];
  /** 默认选中的标签（可选） */
  value?: number;
  /** 选中标签时的回调，返回选中的文本 */
  onSelect: (value: number) => void;
}

// 搜索编辑等题目类型选择器
function TypeSelect({ options, value = 0, onSelect }: TypeSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (value === val) {
      onSelect(0);
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button key={option.id} className="text-sm" variant={value === option.id ? "default" : "outline"} onClick={() => handleSelect(option.id)}>
          {option.itemValue}
        </Button>
      ))}
    </div>
  );
}

interface MultiTagSelectProps {
  /** 标签数据列表 */
  options: TextbookOtherDict[];
  /** 当前选中的 id 列表（受控） */
  value: number[];
  /** 选中值变化时的回调 */
  onChange: (selectedIds: number[]) => void;
}

// 多选题目标签选择器
function MultiTagSelect({ options, value = [], onChange }: MultiTagSelectProps) {
  const handleToggle = (id: number) => {
    let newSelectedIds: number[];
    if (value.includes(id)) {
      newSelectedIds = value.filter((item) => item !== id);
    } else {
      newSelectedIds = [...value, id];
    }
    onChange(newSelectedIds);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value.includes(option.id);
        return (
          <Button
            key={option.id}
            className="text-sm"
            type="button"
            variant={isSelected ? "default" : "outline"}
            onClick={() => handleToggle(option.id)}
          >
            {option.itemValue}
          </Button>
        );
      })}
    </div>
  );
}

// 题目状态选择器
interface StatusSelectProps {
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function StatusSelect({ defaultValue = 0, onSelect }: StatusSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.questionStatusList.map(({ id, value, label }) => (
        <Button key={id} className="text-sm" variant={defaultValue === value ? "default" : "outline"} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 题目类型选择题
interface OtherDictSelectProps {
  defaultValue?: string;
  onSelect: (val: string) => void;
}
function OtherDictSelect({ defaultValue, onSelect }: OtherDictSelectProps) {
  const handleSelect = (val: string) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.questionOtherDictList.map(({ id, value, label }) => (
        <Button key={id} className="text-sm" variant={defaultValue === value ? "default" : "outline"} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 列表详情等标签展示
// 题目类型标签
// 题目本身的标签
// 难度标签
// 题目状态标签
interface TagShowProps {
  pageSource: QuestionPageSourceProps;
  typeValue: string;
  tagNames: string[];
  dimensionNames: string[];
  difficultyLevelValue: number;
  status: number;
}
function TagShow({ pageSource, typeValue, tagNames, dimensionNames, difficultyLevelValue, status }: TagShowProps) {
  // 生成标签列表
  const getBadges = () => {
    // 题目类型
    const typeNode: React.ReactNode = (
      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-sm" key={typeValue}>
        {typeValue}
      </Badge>
    );

    // 题目标签
    const tagNode = tagNames.map((val) => {
      return (
        <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 text-sm" key={val}>
          {val}
        </Badge>
      );
    });

    // 核心素养
    const dimensionNode = dimensionNames.map((val) => {
      return (
        <Badge className="bg-green-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 text-sm" key={val}>
          {val}
        </Badge>
      );
    });

    // 难度
    const difficultyNode = (
      <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-sm" key={difficultyLevelValue}>
        {difficultyLevelValue}
      </Badge>
    );

    // 我的审核和题目需要展示题目状态
    const statusDesc =
      pageSource.source !== "list" ? (
        <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-sm" key={status}>
          {StringConst.questionStatusList[status].label || "草稿中"}
        </Badge>
      ) : (
        ""
      );

    return (
      <>
        {typeNode}
        {tagNode}
        {dimensionNode}
        {difficultyNode}
        {statusDesc}
      </>
    );
  };

  return <>{getBadges()}</>;
}

// 查看题目详情编辑等标签操作
interface OperateTagsProps {
  pageSource: QuestionPageSourceProps;
  questionId: number; // 题目主键
  eightId: number; // 第8层题型标识
  status: number; // 题目状态
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionDimensionDict: Record<number, TextbookOtherDict>;
  questionSearch: QuestionSearch;
  questionListRespMutate: KeyedMutator<QuestionListResp>;

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;

  // 提示加载中
  setLoading?: (value: boolean) => void;
}
function OperateTags({
  pageSource,
  questionId,
  eightId,
  status,
  questionTypeDict,
  questionTagDict,
  questionDimensionDict,
  questionSearch,
  questionListRespMutate,
  setOpenSheet,
  setSheetTitle,
  setSheetDesc,
  setSheetContent,
  setLoading,
}: OperateTagsProps) {
  // 查看详情
  const handleViewInfo = () => {
    setLoading?.(true);

    httpClient
      .get<QuestionInfoResp>(`/question/info/${questionId}`)
      .then((res) => {
        setSheetTitle("查看详情");
        setSheetContent(
          <QuestionInfo
            pageSource={pageSource}
            questionTypeDict={questionTypeDict}
            questionTagDict={questionTagDict}
            questionDimensionDict={questionDimensionDict}
            infoResp={res}
          />,
        );
        setOpenSheet(true);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">`查询题目详情出错: ${err.message}`</div>);
      })
      .finally(() => {
        setLoading?.(false);
      });
  };

  // 编辑详情
  const handleEditInfo = () => {
    setLoading?.(true);

    httpClient
      .get<QuestionInfoResp>(`/question/info/${questionId}`)
      .then((res) => {
        setSheetTitle("编辑详情");
        setSheetDesc("编辑题目信息");
        setSheetContent(
          <Add
            questionSearch={questionSearch}
            setSheetTitle={setSheetTitle}
            setSheetDesc={setSheetDesc}
            setSheetContent={setSheetContent}
            infoResp={res} // 编辑时详情是最高优先级, 会覆盖其它值
          />,
        );
        setOpenSheet(true);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">`编辑查询题目详情出错: ${err.message}`</div>);
      })
      .finally(() => {
        setLoading?.(false);
      });
  };

  // 添加变式题
  const handleSimilarAdd = () => {
    // 变式题将当前题目主键作为变式题的父题标识
    const similarSearch = { sourceId: questionId, ...questionSearch };

    setSheetTitle("添加变式题");
    setSheetDesc("题目需要借助其它 ai 工具转为 markdown 源格式文档后使用");
    setSheetContent(
      <Add questionSearch={similarSearch} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />,
    );
    setOpenSheet(true);
  };

  // 查看变式题列表
  const handleSimilarList = () => {
    setSheetTitle("变式题列表");
    setSheetDesc("变式题暂不支持查看详情");
    setSheetContent(
      <SimilarQuestionList
        questionTypeDict={questionTypeDict}
        questionTagDict={questionTagDict}
        questionDimensionDict={questionDimensionDict}
        questionId={questionId}
        eightId={eightId}
      />,
    );
    setOpenSheet(true);
  };

  // 提交审核
  const [submitApproveRes, setSubmitApproveRes] = useState<{ success: boolean; loading: boolean; message: string } | null>(null);
  const handleSubmitApprove = () => {
    setLoading?.(true);
    setSubmitApproveRes({
      success: false,
      loading: true,
      message: "",
    });
    const req: ApproveReq = {
      id: questionId,
      status: QuestionStatus.Pending,
      rejectReason: "",
    };
    httpClient
      .post("/edit/status", req)
      .then((res) => {
        setSubmitApproveRes({
          success: true,
          loading: false,
          message: "审核通过",
        });
        questionListRespMutate();
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">`提交审核操作出错: ${err.message}`</div>);
        setSubmitApproveRes({
          success: false,
          loading: false,
          message: `审核出错: ${err.message}`,
        });
      })
      .finally(() => {
        setLoading?.(false);
      });
  };

  // 审核题目
  const [approveRes, setApproveRes] = useState<{ success: boolean; loading: boolean; message: string } | null>(null);
  const [approveReq, setApproveReq] = useState<ApproveReq>({
    id: questionId,
    status: QuestionStatus.Drafing,
    rejectReason: "",
  });
  const updateApproveReq = (key: keyof ApproveReq, value: number | string) => {
    setApproveReq((prev) => ({ ...prev, [key]: value }));
  };
  const handleApprove = () => {
    setLoading?.(true);
    setApproveRes({
      success: false,
      loading: true,
      message: "",
    });
    httpClient
      .post("/edit/status", approveReq)
      .then((res) => {
        setApproveRes({
          success: true,
          loading: false,
          message: "审核通过",
        });
        questionListRespMutate();
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">`审核操作出错: ${err.message}`</div>);
        setApproveRes({
          success: false,
          loading: false,
          message: `审核出错: ${err.message}`,
        });
      })
      .finally(() => {
        setLoading?.(false);
      });
  };

  // 删除题目
  const [deleteRes, setDeleteRes] = useState<{ success: boolean; loading: boolean; message: string } | null>(null);
  const handleDelete = () => {
    setLoading?.(true);
    setDeleteRes({
      success: false,
      loading: true,
      message: "",
    });
    const req: DeleteReq = {
      id: questionId,
    };
    httpClient
      .post("/question/delete", req)
      .then((res) => {
        setDeleteRes({
          success: true,
          loading: false,
          message: "删除成功",
        });
        questionListRespMutate();
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">`删除题目出错: ${err.message}`</div>);
        setDeleteRes({
          success: false,
          loading: false,
          message: `删除出错: ${err.message}`,
        });
      })
      .finally(() => {
        setLoading?.(false);
      });
  };

  // 题目标签按钮处理
  const renderButtons = (source: string) => {
    // 详情按钮-所有地方均有
    const buttons = [
      <Button key="detail" variant="link" onClick={handleViewInfo}>
        详情
      </Button>,
    ];

    // 提交审核
    // 我的题目页面状态为草稿中才会出现提交审核
    if (source === "myQuestion" && status === QuestionStatus.Drafing) {
      buttons.push(
        <Dialog key="myQuestionSubmit">
          <DialogTrigger render={<Button variant="link">提交审核</Button>} />
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">提交审核</DialogTitle>
              <DialogDescription className="text-sm">请确认题目没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
            </DialogHeader>
            <div className="mt-3 text-sm text-blue-500">{submitApproveRes?.success ? "提交成功" : submitApproveRes?.message}</div>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" className="text-sm">
                    Cancel
                  </Button>
                }
              />
              <Button className="text-sm" onClick={handleSubmitApprove} disabled={submitApproveRes?.loading}>
                {submitApproveRes?.loading ? "提交审核中" : "提交审核"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
    }

    // 审核题目
    // 我的审核页面状态为待审核的数据才会出现审核按钮
    if (source === "myReview" && status === QuestionStatus.Pending) {
      buttons.push(
        <Dialog key="myReviewApprove">
          <DialogTrigger render={<Button variant="link">题目审核</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">题目审核</DialogTitle>
              <DialogDescription className="text-sm">请确认题目没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
            </DialogHeader>
            <div className="text-sm">
              <div className="flex flex-col gap-3">
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

              <div className="mt-3">
                <Separator />
              </div>

              <div className="mt-3 text-sm text-blue-500">{approveRes?.success ? "审核成功" : approveRes?.message}</div>
            </div>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" className="text-sm">
                    Cancel
                  </Button>
                }
              />
              <Button className="text-sm" onClick={handleApprove} disabled={approveRes?.loading}>
                {approveRes?.loading ? "审核中" : "审核"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
    }

    // 编辑, 审核不能编辑别人的信息, 更不能自己编辑自己审核
    if (pageSource.source !== "myReview") {
      buttons.push(
        <Button key="edit" variant="link" onClick={handleEditInfo}>
          编辑
        </Button>,
      );
    }

    // 添加变式题只有普通页面可以操作
    if (source === "list") {
      buttons.push(
        <Button key="similar" variant="link" onClick={handleSimilarAdd}>
          添加变式题
        </Button>,
      );
    }

    // 查看变式题, 均可以查看
    buttons.push(
      <Button key="list" variant="link" onClick={handleSimilarList}>
        查看变式题
      </Button>,
    );

    // 我的题目可以删除题目
    if (source === "myQuestion") {
      buttons.push(
        <Dialog key="myQuestionDelete">
          <DialogTrigger render={<Button variant="link">删除</Button>} />
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">删除题目</DialogTitle>
              <DialogDescription className="text-sm">题目删除后不可恢复, 如果不确定, 可以保留等后续确认后再删除</DialogDescription>
            </DialogHeader>
            <div className="mt-3 text-sm text-blue-500">{deleteRes?.success ? "删除成功" : deleteRes?.message}</div>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" className="text-sm">
                    Cancel
                  </Button>
                }
              />
              <Button className="text-sm" onClick={handleDelete} disabled={deleteRes?.loading}>
                {deleteRes?.loading ? "删除中" : "删除"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
    }

    return buttons;
  };

  return renderButtons(pageSource.source);
}

export { TypeSelect, MultiTagSelect, StatusSelect, OtherDictSelect, TagShow, OperateTags };
