import React from "react";
import { Input } from "antd";

const { TextArea } = Input;

// 定义 Props 接口
interface SimpleTextAreaProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoSize?: { minRows: number; maxRows: number };
  onStartEdit?: (editing: boolean) => void;
}

// 基本输入框样式
export function SimpleTextArea({
  name,
  value,
  onChange,
  placeholder,
  autoSize = { minRows: 2, maxRows: 5 },
  onStartEdit,
}: SimpleTextAreaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    onStartEdit?.(true);
  };

  return (
    <TextArea
      name={name}
      value={value}
      placeholder={placeholder}
      autoSize={autoSize}
      onChange={handleChange}
    />
  );
}
