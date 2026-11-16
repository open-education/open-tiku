import { Button } from '@/components/ui/button';
import { StringConst } from '@/util/string';

// 试卷上传文件类型选择器
interface FileTypeSelectProps {
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function FileTypeSelect({ defaultValue = 0, onSelect }: FileTypeSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.uploadFileTypeList.map(({ id, value, label }) => (
        <Button key={id} variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 考试类型类型选择器
interface ExamTypeSelectProps {
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function ExamTypeSelect({ defaultValue = 0, onSelect }: ExamTypeSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.examTypeList.map(({ id, value, label }) => (
        <Button key={id} variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 试卷等级类型选择器
interface LevelTypeSelectProps {
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function LevelTypeSelect({ defaultValue = 0, onSelect }: LevelTypeSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.paperLevelTypeList.map(({ id, value, label }) => (
        <Button key={id} variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 试卷难度类型选择器
interface DifficultyTypeSelectProps {
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function DifficultyTypeSelect({ defaultValue = 0, onSelect }: DifficultyTypeSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.paperDifficultyTypeList.map(({ id, value, label }) => (
        <Button key={id} variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

export { DifficultyTypeSelect, ExamTypeSelect, FileTypeSelect, LevelTypeSelect };
