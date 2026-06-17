import { useState } from "react";
import { Button } from "~/components/ui/button";

interface TagSelectProps {
  /** 标签选项数组，例如 ['高考', '中考', '期末'] */
  options: string[];
  /** 默认选中的标签（可选） */
  defaultValue?: string;
  /** 选中标签时的回调，返回选中的文本 */
  onSelect?: (value: string) => void;
  /** 按钮变体，默认 outline */
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function TagSelect({ options, defaultValue = "", onSelect, variant = "outline" }: TagSelectProps) {
  const [selected, setSelected] = useState<string>(defaultValue);

  const handleSelect = (value: string) => {
    // 如果点击的是同一个，取消选中（可选行为）
    if (selected === value) {
      setSelected("");
      onSelect?.("");
      return;
    }

    setSelected(value);
    onSelect?.(value);
  };

  return (
    <div className={"flex flex-wrap gap-2"}>
      {options.map((option) => (
        <Button key={option} variant={selected === option ? "default" : variant} onClick={() => handleSelect(option)}>
          {option}
        </Button>
      ))}
    </div>
  );
}
