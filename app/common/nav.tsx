import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import type { Textbook } from "~/type/textbook";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { StringConst } from "~/util/string";

// 章节导航选择
// 前5层级标识
interface LevelProps {
  first: string | null;
  second: string | null;
  third: string | null;
  fourth: string | null;
  fifth: string | null;
}

const steps: (keyof LevelProps)[] = ["first", "second", "third", "fourth", "fifth"];
const stepLabels: Record<keyof LevelProps, string> = {
  first: "学段",
  second: "科目",
  third: "考点/章节选题",
  fourth: "考点分类/出版社",
  fifth: "考点名称/年级",
};

// 构建层级查找 Map，以 key 为索引
interface TextbookMap {
  byKey: Map<string, Textbook>;
  childrenMap: Map<string, string[]>; // key -> child keys
  rootKeys: string[];
}

function buildTextbookMap(textbooks: Textbook[]): TextbookMap {
  const byKey = new Map<string, Textbook>();
  const childrenMap = new Map<string, string[]>();
  const rootKeys: string[] = [];

  function traverse(items: Textbook[], parentKey?: string) {
    for (const item of items) {
      byKey.set(item.key, item);

      if (parentKey) {
        if (!childrenMap.has(parentKey)) {
          childrenMap.set(parentKey, []);
        }
        childrenMap.get(parentKey)!.push(item.key);
      } else {
        rootKeys.push(item.key);
      }

      if (item.children && item.children.length > 0) {
        traverse(item.children, item.key);
      }
    }
  }

  traverse(textbooks);
  return { byKey, childrenMap, rootKeys };
}

// 根据选中的层级路径获取当前层级的选项（使用 Map 查找）
function getOptionsAtLevel(textbookMap: TextbookMap, selectedValues: LevelProps, levelIndex: number): string[] {
  if (levelIndex === 0) {
    return textbookMap.rootKeys;
  }

  // 获取上一级的 key
  const parentKey = steps[levelIndex - 1];
  const parentValue = selectedValues[parentKey];

  if (!parentValue) return [];

  // 直接通过 Map 获取子节点
  return textbookMap.childrenMap.get(parentValue) || [];
}

// 获取某个层级选中的完整 Textbook（使用 Map 查找）
function getSelectedTextbookAtLevel(textbookMap: TextbookMap, selectedValues: LevelProps, levelIndex: number): Textbook | null {
  const key = steps[levelIndex];
  const value = selectedValues[key];

  if (!value) return null;

  // O(1) 查找
  return textbookMap.byKey.get(value) || null;
}

interface ChapterExpandNavProps {
  // textbooks 网站原始前5层级导航信息
  textbooks: Textbook[];
  // 选择 Option 时监听选中项的外部函数
  onSelectionChange?: (selection: LevelProps, selectedTextbooks: Record<keyof LevelProps, Textbook | null>) => void;
  // 导航区域下面操作按钮
  actions?: React.ReactNode;
}

// 平铺展开式的导航样式-适用于首页
function ChapterExpandNav(props: ChapterExpandNavProps) {
  const { textbooks = [], onSelectionChange, actions } = props;

  // 构建 Map 索引（只在 textbooks 变化时重新构建）
  const textbookMap = useMemo(() => buildTextbookMap(textbooks), [textbooks]);

  // 状态管理, value 存储 Textbook.key
  const [selectedValues, setSelectedValues] = useState<LevelProps>({
    first: null,
    second: null,
    third: null,
    fourth: null,
    fifth: null,
  });

  // 计算已完成数量
  const completedCount = useMemo(() => {
    return steps.filter((key) => selectedValues[key] !== null).length;
  }, [selectedValues]);

  // 计算选中对象的缓存（避免重复计算）
  const selectedTextbooks = useMemo(() => {
    const result: Record<keyof LevelProps, Textbook | null> = {
      first: null,
      second: null,
      third: null,
      fourth: null,
      fifth: null,
    };

    steps.forEach((key, index) => {
      result[key] = getSelectedTextbookAtLevel(textbookMap, selectedValues, index);
    });

    return result;
  }, [textbookMap, selectedValues]);

  // 当选中状态变化时通知父组件
  useEffect(() => {
    onSelectionChange?.(selectedValues, selectedTextbooks);
  }, [selectedValues, selectedTextbooks]);

  // 处理层级选择
  const handleLevelSelect = useCallback(
    (levelKey: keyof LevelProps, textbook: Textbook) => {
      const levelIndex = steps.indexOf(levelKey);

      // 清空当前层级及之后的所有层级
      const newValues: LevelProps = {
        first: selectedValues.first,
        second: selectedValues.second,
        third: selectedValues.third,
        fourth: selectedValues.fourth,
        fifth: selectedValues.fifth,
      };

      for (let i = levelIndex; i < steps.length; i++) {
        const key = steps[i];
        newValues[key] = null;
      }

      newValues[levelKey] = textbook.key;
      setSelectedValues(newValues);
    },
    [selectedValues],
  );

  // 检查某个层级是否可用（前置层级已选择）
  const isLevelEnabled = useCallback(
    (levelIndex: number): boolean => {
      if (levelIndex === 0) return textbookMap.rootKeys.length > 0;
      const prevKey = steps[levelIndex - 1];
      return selectedValues[prevKey] !== null;
    },
    [selectedValues, textbookMap.rootKeys.length],
  );

  // 检查某个层级是否已被选中
  const isLevelSelected = useCallback(
    (levelIndex: number): boolean => {
      const key = steps[levelIndex];
      return selectedValues[key] !== null;
    },
    [selectedValues],
  );

  return (
    <section>
      <Card className="p-0 pb-4">
        <Progress value={(completedCount / 5) * 100} className="rounded-none" />
        <CardContent>
          <div className="divide-y divide-border">
            {steps.map((levelKey, index) => {
              // 获取当前层级的选项 keys
              const optionKeys = getOptionsAtLevel(textbookMap, selectedValues, index);
              const enabled = isLevelEnabled(index);
              const isSelected = isLevelSelected(index);
              const selectedKey = selectedValues[levelKey];

              return (
                <LevelExt
                  key={levelKey}
                  levelKey={levelKey}
                  keyDesc={stepLabels[levelKey] || ""}
                  enabled={enabled}
                  isSelected={isSelected}
                  optionKeys={optionKeys}
                  textbookMap={textbookMap}
                  selectedKey={selectedKey}
                  onSelect={(textbook) => handleLevelSelect(levelKey, textbook)}
                />
              );
            })}
          </div>

          {/* 底部操作区域 - 由父组件控制 */}
          {actions && (
            <div className={cn("mt-5 pt-5 transition-all duration-300", completedCount === 5 ? "opacity-100" : "opacity-0 pointer-events-none")}>
              <Separator className="mb-4" />
              {actions}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

// 生成一个维度的层级信息
interface LevelExtProps {
  levelKey: keyof LevelProps;
  keyDesc: string;
  enabled: boolean;
  isSelected: boolean;
  optionKeys: string[];
  textbookMap: TextbookMap;
  selectedKey: string | null;
  onSelect: (textbook: Textbook) => void;
}

function LevelExt(props: LevelExtProps) {
  const { levelKey, keyDesc, enabled, isSelected, optionKeys, textbookMap, selectedKey, onSelect } = props;

  // 将 keys 转换为 Textbook 对象（仅当需要显示时）
  const options = useMemo(() => {
    return optionKeys.map((key) => textbookMap.byKey.get(key)).filter((item): item is Textbook => item !== undefined);
  }, [optionKeys, textbookMap.byKey]);

  return (
    <div className={cn("py-4 first:pt-0 transition-opacity duration-200", !enabled && "opacity-25 pointer-events-none select-none")}>
      <div className="flex items-start gap-5">
        {/* Label with check indicator */}
        <div className="flex items-center gap-2.5 w-30 shrink-0 mt-1.5">
          <span
            className={cn(
              "w-4 h-4 rounded-full shrink-0 border-2 flex items-center justify-center transition-colors",
              isSelected ? "bg-primary border-primary" : "border-muted-foreground/35",
            )}
          >
            {isSelected && (
              <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">{keyDesc}</span>
        </div>

        {/* Option pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          {options.length > 0 ? (
            options.map((opt) => (
              <Button
                key={opt.key}
                className="text-sm"
                variant={selectedKey === opt.key ? "default" : "outline"}
                onClick={() => onSelect(opt)}
                disabled={!enabled}
              >
                {opt.label}
              </Button>
            ))
          ) : (
            <span className="text-sm text-muted-foreground/40 mt-1.5 italic">{enabled ? "暂无选项" : "请先完成上一步"}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChapterDropdownNavProps {
  textbooks: Textbook[];
  onSelect?: (selectedItems: Textbook[]) => void;
  defaultSelectedKeys?: string[];
  placeholder?: string;
  maxDepth?: number;
}
// 下拉菜单样式的导航-适用于搜索一类的列表也
function ChapterDropdownNav(props: ChapterDropdownNavProps) {
  const { textbooks, onSelect, defaultSelectedKeys = [], placeholder = "请选择学段", maxDepth = 5 } = props;

  const [selectedPath, setSelectedPath] = useState<Textbook[]>([]);
  const [open, setOpen] = useState(false);

  // 构建 key 到节点的映射表，优化查找性能 O(1)
  const nodeMap = useMemo(() => {
    const map = new Map<string, Textbook>();

    const traverse = (nodes: Textbook[]) => {
      for (const node of nodes) {
        map.set(node.key, node);
        if (node.children) {
          traverse(node.children);
        }
      }
    };

    traverse(textbooks);
    return map;
  }, [textbooks]);

  // 构建 key 到父级 key 的映射，用于快速获取路径
  const parentMap = useMemo(() => {
    const map = new Map<string, string | null>();

    const traverse = (nodes: Textbook[], parentKey: string | null = null) => {
      for (const node of nodes) {
        map.set(node.key, parentKey);
        if (node.children) {
          traverse(node.children, node.key);
        }
      }
    };

    traverse(textbooks);
    return map;
  }, [textbooks]);

  // 获取从根到指定节点的路径（使用映射表优化）
  const getPathToNode = useCallback(
    (key: string): Textbook[] | null => {
      if (!nodeMap.has(key)) return null;

      const path: Textbook[] = [];
      let currentKey: string | null = key;

      // 从当前节点向上遍历到根节点
      while (currentKey) {
        const node = nodeMap.get(currentKey);
        if (!node) break;
        path.unshift(node);
        currentKey = parentMap.get(currentKey) || null;
      }

      return path;
    },
    [nodeMap, parentMap],
  );

  // 根据 key 数组查找路径（使用映射表优化）
  const findPathByKeys = useCallback(
    (keys: string[]): Textbook[] | null => {
      if (keys.length === 0) return null;

      // 验证所有 key 是否存在且是连续路径
      const path: Textbook[] = [];
      let parentKey: string | null = null;

      for (const key of keys) {
        const node = nodeMap.get(key);
        if (!node) return null;

        // 验证父子关系, 第8层级不满足这个要求, 第8层级不验证, 第8层的 tableName 字段为 question_cate
        if (node.tableName !== StringConst.questionCateTableName && parentKey !== null && node.parentId !== nodeMap.get(parentKey)?.id) {
          return null;
        }

        path.push(node);
        parentKey = key;
      }

      return path;
    },
    [nodeMap],
  );

  // 初始化默认选中
  useEffect(() => {
    if (defaultSelectedKeys.length > 0) {
      const path = findPathByKeys(defaultSelectedKeys);
      if (path) {
        setSelectedPath(path);
      }
    }
  }, [defaultSelectedKeys, findPathByKeys]);

  // 处理选择
  const handleSelect = useCallback(
    (item: Textbook) => {
      const path = getPathToNode(item.key);
      if (path) {
        setSelectedPath(path);
        if (onSelect) {
          onSelect(path);
        }
        setOpen(false);
      }
    },
    [onSelect, getPathToNode],
  );

  // 判断节点是否在选中路径中
  const isNodeInSelectedPath = useCallback(
    (key: string): boolean => {
      return selectedPath.some((p) => p.key === key);
    },
    [selectedPath],
  );

  // 判断节点是否被选中（路径的最后一个）
  const isNodeSelected = useCallback(
    (key: string): boolean => {
      return selectedPath.length > 0 && selectedPath[selectedPath.length - 1].key === key;
    },
    [selectedPath],
  );

  // 渲染菜单项（递归）
  const renderMenuItems = useCallback(
    (items: Textbook[], depth: number = 0): React.ReactNode => {
      if (depth >= maxDepth) {
        return (
          <DropdownMenuGroup>
            {items.map((item) => (
              <DropdownMenuItem
                key={item.key}
                className={cn("flex items-center justify-between cursor-pointer", isNodeSelected(item.key) && "bg-accent text-accent-foreground")}
                onClick={() => handleSelect(item)}
              >
                <span className="text-sm">{item.label}</span>
                {isNodeSelected(item.key) && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        );
      }

      return (
        <DropdownMenuGroup>
          {items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isSelected = isNodeSelected(item.key);
            const isInPath = isNodeInSelectedPath(item.key);

            if (hasChildren && depth < maxDepth - 1) {
              return (
                <DropdownMenuSub key={item.key}>
                  <DropdownMenuSubTrigger className={cn("flex items-center justify-between w-full cursor-pointer", isInPath && "bg-accent/50")}>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {isSelected && <Check className="ml-2 h-4 w-4" />}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="min-w-50 p-1">
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="flex items-center justify-between cursor-pointer" onClick={() => handleSelect(item)}>
                        <span className="text-sm">选择 {item.label}</span>
                        {isSelected && <Check className="ml-2 h-4 w-4" />}
                      </DropdownMenuItem>
                      {item.children && item.children.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          {renderMenuItems(item.children, depth + 1)}
                        </>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            } else {
              return (
                <DropdownMenuItem
                  key={item.key}
                  className={cn("flex items-center justify-between cursor-pointer", isSelected && "bg-accent text-accent-foreground")}
                  onClick={() => handleSelect(item)}
                >
                  <span className="text-sm">{item.label}</span>
                  {isSelected && <Check className="ml-2 h-4 w-4" />}
                </DropdownMenuItem>
              );
            }
          })}
        </DropdownMenuGroup>
      );
    },
    [maxDepth, handleSelect, isNodeSelected, isNodeInSelectedPath],
  );

  // 获取当前选中的显示文本
  const getDisplayText = useCallback(() => {
    if (selectedPath.length === 0) {
      return placeholder;
    }
    return selectedPath.map((item) => item.label).join(" / ");
  }, [selectedPath, placeholder]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="w-full sm:w-auto justify-between">
            <span className="truncate text-sm">{getDisplayText()}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <DropdownMenuContent className="min-w-50 max-h-150 overflow-y-auto p-1">
        <DropdownMenuGroup>
          <DropdownMenuLabel>选择学段</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {renderMenuItems(textbooks, 0)}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 导航选择记录数据
interface SelectNavProps {
  selectedKeys: string[];
  relatedId: number;
  relatedName: string;
}

export type { LevelProps, SelectNavProps };
export { ChapterExpandNav, ChapterDropdownNav };
