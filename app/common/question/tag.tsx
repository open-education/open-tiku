/// 题目题目相关标签选择器

import { useState } from "react";
import { Button } from "~/components/ui/button";
import type { TextbookOtherDict } from "~/type/textbook";

interface TypeSelectProps {
  /** 标签选项数组 */
  options: TextbookOtherDict[];
  /** 默认选中的标签（可选） */
  defaultValue?: number;
  /** 选中标签时的回调，返回选中的文本 */
  onSelect: (value: number) => void;
}

// 搜索编辑等题目类型选择器
function TypeSelect({ options, defaultValue = 0, onSelect }: TypeSelectProps) {
  const [selected, setSelected] = useState<number>(defaultValue);

  const handleSelect = (value: number) => {
    // 如果点击的是同一个，取消选中（可选行为）
    if (selected === value) {
      setSelected(0);
      onSelect(0);
      return;
    }

    setSelected(value);
    onSelect(value);
  };

  return (
    <div className={"flex flex-wrap gap-2"}>
      {options.map((option) => {
        return (
          <Button key={option.id} variant={selected && selected === option.id ? "default" : "outline"} onClick={() => handleSelect(option.id)}>
            {option.itemValue}
          </Button>
        );
      })}
    </div>
  );
}

interface MultiTagSelectProps {
  /** 标签数据列表 */
  options: TextbookOtherDict[];
  /** 当前选中的 id 列表（受控） */
  defaultValue: number[];
  /** 选中值变化时的回调 */
  onChange: (selectedIds: number[]) => void;
}

// 多选题目标签选择器
function MultiTagSelect({ options, defaultValue = [], onChange }: MultiTagSelectProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(defaultValue);

  const handleToggle = (id: number) => {
    let newSelectedIds: number[];

    // 如果已经选择过说明点击要变为取消
    if (selectedIds.includes(id)) {
      newSelectedIds = selectedIds.filter((item) => item !== id);
    } else {
      newSelectedIds = [...selectedIds, id];
    }

    setSelectedIds(newSelectedIds);
    onChange(newSelectedIds);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <Button key={option.id} type="button" variant={isSelected ? "default" : "outline"} onClick={() => handleToggle(option.id)}>
            {option.itemValue}
          </Button>
        );
      })}
    </div>
  );
}

export { TypeSelect, MultiTagSelect };
