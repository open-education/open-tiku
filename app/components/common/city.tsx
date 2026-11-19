import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
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
  provinceId?: number;
  cityId?: number;
  onChange?: (province: CityResp, city?: CityResp) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

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
  provinceId,
  cityId,
  onChange,
  placeholder = '请选择省 / 市',
  disabled = false,
  className,
}: CitySelectProps) {
  const [internalSelection, setInternalSelection] = useState<{ provinceId?: number; cityId?: number }>({
    provinceId,
    cityId,
  });
  const [open, setOpen] = useState(false);

  const isControlled = provinceId !== undefined || cityId !== undefined;
  const activeProvinceId = isControlled ? provinceId : internalSelection.provinceId;
  const activeCityId = isControlled ? cityId : internalSelection.cityId;

  const handleSelectItem = (province: CityResp, city?: CityResp) => {
    setInternalSelection({ provinceId: province.id, cityId: city?.id });
    onChange?.(province, city);
    setOpen(false);
  };

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

    const cGroupsMap = new Map<number, [string, CityResp[]][]>();
    citiesByParent.forEach((cities, parentId) => {
      cGroupsMap.set(parentId, groupByInitial(cities));
    });

    let label = '';
    if (activeCityId && activeCityId > 0) {
      const city = cityMap.get(activeCityId);
      if (city) {
        const parent = activeProvinceId ? provinceMap.get(activeProvinceId) : city.parentId ? provinceMap.get(city.parentId) : undefined;
        label = parent && parent.name !== city.name ? `${parent.name} / ${city.name}` : city.name;
      }
    } else if (activeProvinceId && activeProvinceId > 0) {
      label = provinceMap.get(activeProvinceId)?.name || '';
    }

    return {
      provinceGroups: groupByInitial(provinces),
      cityGroupsMap: cGroupsMap,
      selectedLabel: label,
    };
  }, [cityRespList, activeProvinceId, activeCityId]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
              const isProvinceOnlySelected = activeProvinceId === province.id && !activeCityId;
              const isProvinceActive = activeProvinceId === province.id;

              if (cityGroups.length === 0) {
                return (
                  <DropdownMenuItem key={province.id} onClick={() => handleSelectItem(province)}>
                    <span className="flex-1">{province.name}</span>
                    {isProvinceOnlySelected && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                );
              }

              return (
                <DropdownMenuSub key={province.id}>
                  <DropdownMenuSubTrigger
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectItem(province);
                    }}
                  >
                    <span className="flex-1">{province.name}</span>
                    {isProvinceActive && <Check className="mr-1 h-4 w-4" />}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-44 max-h-80 overflow-y-auto">
                      <DropdownMenuItem onClick={() => handleSelectItem(province)}>
                        <span className="flex-1 font-medium">{province.name}（全省）</span>
                        {isProvinceOnlySelected && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {cityGroups.map(([cInitial, cities]) => (
                        <DropdownMenuGroup key={cInitial}>
                          {cities.map((city) => (
                            <DropdownMenuItem key={city.id} onClick={() => handleSelectItem(province, city)}>
                              <span className="flex-1">{city.name}</span>
                              {activeCityId === city.id && <Check className="h-4 w-4" />}
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
