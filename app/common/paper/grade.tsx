import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

/// 年级选择器

interface GradeSelectProps {
  value?: string;
  onValueChange?: (value: string | null) => void; // 改为 string | null
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function GradeSelect({ value, onValueChange, placeholder = "选择年份", className = "w-50", disabled = false }: GradeSelectProps) {
  const [internalValue, setInternalValue] = useState<string | null>(null);

  // 生成年级
  const grades = ["不选", "高三", "高二", "高一", "九年级", "八年级", "七年级", "六年级", "五年级", "四年级", "三年级", "二年级", "一年级"];

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
        {grades.map((grade) => (
          <SelectItem key={grade} value={grade.toString()} className="text-sm">
            {grade}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { GradeSelect };
