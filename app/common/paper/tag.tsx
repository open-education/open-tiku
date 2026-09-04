import { useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { StringConst, StringValidator } from '~/util/string';

/// 标签选择器

interface TagSelectProps {
  /** 标签选项数组，例如 ['高考', '中考', '期末'] */
  options: string[];
  /** 默认选中的标签（可选） */
  defaultValue?: string;
  /** 选中标签时的回调，返回选中的文本 */
  onSelect?: (value: string) => void;
  /** 按钮变体，默认 outline */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

// 搜索编辑等标签选择器
function TagSelect({ options, defaultValue = '', onSelect, variant = 'outline' }: TagSelectProps) {
  const [selected, setSelected] = useState<string>(defaultValue);

  const handleSelect = (value: string) => {
    // 如果点击的是同一个，取消选中（可选行为）
    if (selected === value) {
      setSelected('');
      onSelect?.('');
      return;
    }

    setSelected(value);
    onSelect?.(value);
  };

  return (
    <div className={'flex flex-wrap gap-2'}>
      {options.map((option) => {
        return (
          <Button
            key={option}
            variant={selected && selected === option ? 'default' : variant}
            className="text-sm"
            onClick={() => handleSelect(option)}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
}

// 列表详情等标签展示
interface TagShowProps {
  relatedName: string;
  tag: string;
  year: string;
  grade: string;
  semester: string;
}
function TagShow({ relatedName, tag, year, grade, semester }: TagShowProps) {
  // 生成标签列表
  const getBadges = () => {
    const tags: string[] = [];

    if (StringValidator.isNonEmpty(relatedName)) {
      tags.push(relatedName);
    }

    if (StringValidator.isNonEmpty(tag)) {
      tags.push(tag);
    }

    if (StringValidator.isNonEmpty(year)) {
      tags.push(year);
    }

    if (StringValidator.isNonEmpty(grade) && grade !== '不选') {
      tags.push(grade);
    }

    if (StringValidator.isNonEmpty(semester) && semester !== '不选') {
      tags.push(semester);
    }

    return tags.map((val, index) => {
      return (
        <Badge key={index} className="text-sm bg-sky-50 text-sky-700 border-sky-100">
          {val}
        </Badge>
      );
    });
  };

  return <>{getBadges()}</>;
}

// 试卷状态选择器
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
      {StringConst.paperStatusList.map(({ id, value, label }) => (
        <Button key={id} className="text-sm" variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

export { TagSelect, TagShow, StatusSelect };
