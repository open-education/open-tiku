import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

/// 年选择器

interface YearSelectProps {
  value?: string;
  onValueChange?: (value: string | null) => void; // 改为 string | null
  placeholder?: string;
  startYear?: number;
  endYear?: number;
  className?: string;
  disabled?: boolean;
}

function YearSelect({
  value,
  onValueChange,
  placeholder = '选择年份',
  startYear = 2000,
  endYear = new Date().getFullYear(),
  className = 'w-50',
  disabled = false,
}: YearSelectProps) {
  const [internalValue, setInternalValue] = useState<string | null>(null);

  // 生成年份列表（从 endYear 到 startYear 倒序）
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);

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
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()} className="text-sm">
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { YearSelect };
