import { Button } from '@/components/ui/button';
import { StringConst } from '@/util/string';

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
    <div className="flex flex-wrap gap-2 justify-start">
      {StringConst.studentStatusList.map(({ id, value, label }) => (
        <Button key={id} variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

export { StatusSelect };
