import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

/// 学期选择器

interface SemesterSelectProps {
  value?: string;
  onValueChange?: (value: string | null) => void; // 改为 string | null
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function SemesterSelect({ value, onValueChange, placeholder = "选择学期", className = "w-50", disabled = false }: SemesterSelectProps) {
  const [internalValue, setInternalValue] = useState<string | null>(null);

  // 生成学期
  const semesters = [
    "不选",
    "高三下",
    "高三上",
    "高二下",
    "高二上",
    "高一下",
    "高一上",
    "九年级下",
    "九年级上",
    "八年级下",
    "八年级上",
    "七年级下",
    "七年级上",
    "六年级下",
    "六年级上",
    "五年级下",
    "五年级上",
    "四年级下",
    "四年级上",
    "三年级下",
    "三年级上",
    "二年级下",
    "二年级上",
    "一年级下",
    "一年级上",
  ];

  const handleValueChange = (newValue: string | null) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  const currentValue = value !== undefined ? value : internalValue;

  return (
    <Select value={currentValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue className="text-sm" placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {semesters.map((semester) => (
          <SelectItem key={semester} value={semester.toString()} className="text-sm">
            {semester}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { SemesterSelect };
