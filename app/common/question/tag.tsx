import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { QuestionInfoResp, QuestionSearch } from "~/type/question";
import type { TextbookOtherDict } from "~/type/textbook";
import { httpClient } from "~/util/http";
import { QuestionInfo } from "~/common/question/info";
import { SimilarQuestionList } from "~/question/similar";
import Add from "~/question/add";
import { toast } from "sonner";

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
        <Button key={option.id} variant={value === option.id ? "default" : "outline"} onClick={() => handleSelect(option.id)}>
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
          <Button key={option.id} type="button" variant={isSelected ? "default" : "outline"} onClick={() => handleToggle(option.id)}>
            {option.itemValue}
          </Button>
        );
      })}
    </div>
  );
}

// 列表详情等标签展示
// 题目类型标签
// 题目本身的标签
// 难度标签
interface TagShowProps {
  typeValue: string;
  tagNames: string[];
  difficultyLevelValue: number;
}
function TagShow({ typeValue, tagNames, difficultyLevelValue }: TagShowProps) {
  // 生成标签列表
  const getBadges = () => {
    // 题目类型
    const typeNode: React.ReactNode = (
      <Badge variant={"outline"} key={typeValue}>
        {typeValue}
      </Badge>
    );

    // 题目标签
    const tagNode = tagNames.map((val) => {
      return (
        <Badge variant={"outline"} key={val}>
          {val}
        </Badge>
      );
    });

    // 难度
    const difficultyNode = (
      <Badge variant={"outline"} key={difficultyLevelValue}>
        {difficultyLevelValue}
      </Badge>
    );

    return (
      <>
        {typeNode}
        {tagNode}
        {difficultyNode}
      </>
    );
  };

  return <>{getBadges()}</>;
}

// 查看题目详情编辑等标签操作
interface OperateTagsProps {
  questionId: number; // 题目主键
  eightId: number; // 第8层题型标识
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionSearch: QuestionSearch;

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;

  // 提示加载中
  setLoading?: (value: boolean) => void;
}
function OperateTags({
  questionId,
  eightId,
  questionTypeDict,
  questionTagDict,
  questionSearch,
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
        setSheetContent(<QuestionInfo questionTypeDict={questionTypeDict} questionTagDict={questionTagDict} infoResp={res} />);
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
  const handleSimiarList = () => {
    setSheetTitle("变式题列表");
    setSheetDesc("变式题暂不支持查看详情");
    setSheetContent(
      <SimilarQuestionList questionTypeDict={questionTypeDict} questionTagDict={questionTagDict} questionId={questionId} eightId={eightId} />,
    );
    setOpenSheet(true);
  };

  return (
    <>
      <Button variant={"link"} onClick={handleViewInfo}>
        详情
      </Button>
      <Button variant={"link"} onClick={handleEditInfo}>
        编辑
      </Button>
      <Button variant={"link"} onClick={handleSimilarAdd}>
        添加变式题
      </Button>
      <Button variant={"link"} onClick={handleSimiarList}>
        查看变式题
      </Button>
    </>
  );
}

export { TypeSelect, MultiTagSelect, TagShow, OperateTags };
