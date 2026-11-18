import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from 'cn';
import { Check, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface CityResp {
  id: number;
  parentId?: number;
  name: string;
  pinyinInitial: string;
  level: number;
}

interface CitySelectProps {
  cityRespList: CityResp[];
  value?: number;
  onChange?: (city: CityResp, province?: CityResp) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// 按 pinyinInitial 小写字母升序分组，同字母保留原数组顺序
function groupByInitial(list: CityResp[]) {
  const map = new Map<string, CityResp[]>();
  for (const item of list) {
    const key = (item.pinyinInitial?.trim().charAt(0) || '#').toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'en'));
}

export default function CitySelect({
  cityRespList = [],
  value,
  onChange,
  placeholder = '请选择省 / 市',
  disabled = false,
  className,
}: CitySelectProps) {
  // 增加内部状态兜底：即使外部未传 value，选中后也能立即显示
  const [internalValue, setInternalValue] = useState<number | undefined>(value);
  const currentValue = value !== undefined ? value : internalValue;

  const handleSelectItem = (city: CityResp, province?: CityResp) => {
    setInternalValue(city.id);
    onChange?.(city, province);
  };

  // 整理省市层级与分组
  const { provinceGroups, cityGroupsMap, selectedLabel } = useMemo(() => {
    const provinces: CityResp[] = [];
    const provinceMap = new Map<number, CityResp>();
    const cityMap = new Map<number, CityResp>();
    const citiesByParent = new Map<number, CityResp[]>();

    for (const item of cityRespList) {
      if (item.level === 1 || !item.parentId) {
        provinces.push(item);
        provinceMap.set(item.id, item);
      } else {
        cityMap.set(item.id, item);
        if (!citiesByParent.has(item.parentId)) {
          citiesByParent.set(item.parentId, []);
        }
        citiesByParent.get(item.parentId)!.push(item);
      }
    }

    // 为每个省的城市列表按首字母分组
    const cGroupsMap = new Map<number, [string, CityResp[]][]>();
    citiesByParent.forEach((cities, parentId) => {
      cGroupsMap.set(parentId, groupByInitial(cities));
    });

    // 计算回显文案（使用 == 兼容后端 id 偶发为 string 或 number 的情况）
    let label = '';
    if (currentValue != null) {
      const targetId = Number(currentValue);
      const city = cityMap.get(targetId);
      if (city) {
        const parent = city.parentId ? provinceMap.get(city.parentId) : undefined;
        label = parent && parent.name !== city.name ? `${parent.name} / ${city.name}` : city.name;
      } else {
        label = provinceMap.get(targetId)?.name || '';
      }
    }

    return {
      provinceGroups: groupByInitial(provinces),
      cityGroupsMap: cGroupsMap,
      selectedLabel: label,
    };
  }, [cityRespList, currentValue]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn('w-full sm:w-auto justify-between', !selectedLabel && 'text-muted-foreground', className)}
          >
            <span className="truncate">{selectedLabel || placeholder}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />

      <DropdownMenuContent align="start" className="min-w-50 max-h-75 overflow-y-auto p-1">
        {provinceGroups.map(([initial, provinces]) => (
          <DropdownMenuGroup key={initial}>
            {provinces.map((province) => {
              const cityGroups = cityGroupsMap.get(province.id) || [];

              // 无下级城市时直接作为普通菜单项
              if (cityGroups.length === 0) {
                return (
                  <DropdownMenuItem key={province.id} onClick={() => handleSelectItem(province)}>
                    <span className="flex-1">{province.name}</span>
                    {Number(currentValue) === province.id && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                );
              }

              // 有下级城市时渲染级联子菜单
              return (
                <DropdownMenuSub key={province.id}>
                  <DropdownMenuSubTrigger>{province.name}</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-44 max-h-80 overflow-y-auto">
                      {cityGroups.map(([cInitial, cities]) => (
                        <DropdownMenuGroup key={cInitial}>
                          {cities.map((city) => (
                            <DropdownMenuItem key={city.id} onClick={() => handleSelectItem(city, province)}>
                              <span className="flex-1">{city.name}</span>
                              {Number(currentValue) === city.id && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              );
            })}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
