import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { TextbookResp } from '@/type/textbook';
import { cn } from 'cn';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// 章节导航选择
// 前5层级标识
interface LevelProps {
  first: string | null;
  second: string | null;
  third: string | null;
  fourth: string | null;
  fifth: string | null;
}

const steps: (keyof LevelProps)[] = ['first', 'second', 'third', 'fourth', 'fifth'];
const stepLabels: Record<keyof LevelProps, string> = {
  first: '学段',
  second: '科目',
  third: '考点/章节选题',
  fourth: '考点分类/出版社',
  fifth: '考点名称/年级',
};

// 构建层级查找 Map，以 key 为索引
interface TextbookMap {
  byKey: Map<string, TextbookResp>;
  childrenMap: Map<string, string[]>; // key -> child keys
  rootKeys: string[];
}

function buildTextbookMap(textbooks: TextbookResp[]): TextbookMap {
  const byKey = new Map<string, TextbookResp>();
  const childrenMap = new Map<string, string[]>();
  const rootKeys: string[] = [];

  function traverse(items: TextbookResp[], parentKey?: string) {
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
function getSelectedTextbookAtLevel(textbookMap: TextbookMap, selectedValues: LevelProps, levelIndex: number): TextbookResp | null {
  const key = steps[levelIndex];
  const value = selectedValues[key];

  if (!value) return null;

  // O(1) 查找
  return textbookMap.byKey.get(value) || null;
}

interface ChapterExpandNavProps {
  // textbooks 网站原始前5层级导航信息
  textbooks: TextbookResp[];
  // 选择 Option 时监听选中项的外部函数
  onSelectionChange?: (selection: LevelProps, selectedTextbooks: Record<keyof LevelProps, TextbookResp | null>) => void;
}

// 平铺展开式的导航样式-适用于首页
function ChapterExpandNav(props: ChapterExpandNavProps) {
  const { textbooks = [], onSelectionChange } = props;

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

  // 计算选中对象的缓存（避免重复计算）
  const selectedTextbooks = useMemo(() => {
    const result: Record<keyof LevelProps, TextbookResp | null> = {
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
    (levelKey: keyof LevelProps, textbook: TextbookResp) => {
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
    <div className="divide-y divide-dotted">
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
            keyDesc={stepLabels[levelKey] || ''}
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
  onSelect: (textbook: TextbookResp) => void;
}

function LevelExt(props: LevelExtProps) {
  const { levelKey, keyDesc, enabled, isSelected, optionKeys, textbookMap, selectedKey, onSelect } = props;

  // 将 keys 转换为 Textbook 对象（仅当需要显示时）
  const options = useMemo(() => {
    return optionKeys.map((key) => textbookMap.byKey.get(key)).filter((item): item is TextbookResp => item !== undefined);
  }, [optionKeys, textbookMap.byKey]);

  return (
    <div className={cn('py-1 first:pt-0 transition-opacity duration-200', !enabled && 'opacity-25 pointer-events-none select-none')}>
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 w-30 shrink-0 mt-1.5">
          <span
            className={cn(
              'w-4 h-4 rounded-full shrink-0 border-2 flex items-center justify-center transition-colors',
              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/35',
            )}
          >
            {isSelected && (
              <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{keyDesc}</span>
        </div>

        <div className="flex flex-wrap gap-2 flex-1">
          {options.length > 0 ? (
            options.map((opt) => (
              <Button key={opt.key} variant={selectedKey === opt.key ? 'default' : 'outline'} onClick={() => onSelect(opt)} disabled={!enabled}>
                {opt.label}
              </Button>
            ))
          ) : (
            <span className="text-xs text-muted-foreground/40 mt-1.5 italic">{enabled ? '暂无选项' : '请先完成上一步'}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// 树形展开导航菜单
interface CheckboxTreeNode extends TextbookResp {
  children?: CheckboxTreeNode[];
}

interface TreeCheckboxProps {
  textbooks: CheckboxTreeNode[];
  onSelect?: (selectedItems: CheckboxTreeNode[]) => void;
  defaultSelectedKeys?: string[];
  maxDepth?: number; // 保留，让使用者控制深度
}

// 树节点渲染函数 - 完全展开版本
const renderTreeNodes = (
  items: CheckboxTreeNode[],
  depth: number,
  maxDepth: number,
  selectedKeys: Set<string>,
  expandedKeys: Set<string>,
  onToggleExpand: (key: string) => void,
  onToggleSelect: (node: CheckboxTreeNode, checked: boolean) => void,
  onSelectLeaf?: (node: CheckboxTreeNode) => void,
): React.ReactNode => {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isSelected = selectedKeys.has(item.key);
        const isExpanded = expandedKeys.has(item.key);
        const canExpand = hasChildren && depth < maxDepth - 1;

        // 计算子节点选中状态
        let childStatus: 'none' | 'all' | 'partial' = 'none';
        if (hasChildren) {
          const children = item.children!;
          const total = children.length;
          const selected = children.filter((child) => selectedKeys.has(child.key)).length;
          if (selected === total) childStatus = 'all';
          else if (selected > 0) childStatus = 'partial';
        }

        return (
          <div key={item.key} className="relative">
            <div
              className={cn('flex items-center gap-2 p-2 hover:bg-accent/50 transition-colors', isSelected && 'bg-accent/30')}
              style={{ paddingLeft: `${depth * 20 + 8}px` }}
            >
              {/* 展开/折叠按钮 */}
              {canExpand && (
                <button onClick={() => onToggleExpand(item.key)} className="p-0.5 hover:bg-accent transition-colors">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}

              {/* 占位空间 - 保持对齐 */}
              {!canExpand && <div className="w-5" />}

              {/* 复选框 */}
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  onToggleSelect(item, checked as boolean);
                }}
                onClick={(e) => e.stopPropagation()}
                data-state={childStatus === 'partial' ? 'indeterminate' : undefined}
                className="shrink-0"
              />

              {/* 标签 */}
              <span className="text-xs flex-1">{item.label}</span>

              {/* 子节点数量徽标 */}
              {hasChildren && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5 shrink-0">
                  {item.children?.length}
                </Badge>
              )}

              {/* 选中标记 */}
              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </div>

            {/* 递归渲染子节点 */}
            {canExpand && isExpanded && hasChildren && (
              <div className="border-l-2 border-muted ml-6">
                {renderTreeNodes(item.children!, depth + 1, maxDepth, selectedKeys, expandedKeys, onToggleExpand, onToggleSelect, onSelectLeaf)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 属性多选择树形组件 - 完全展开版本
function ChapterTreeCheckboxNav({ textbooks, onSelect, defaultSelectedKeys = [], maxDepth = 5 }: TreeCheckboxProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set(defaultSelectedKeys));
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    // 默认展开所有节点
    const allKeys = new Set<string>();
    const traverse = (nodes: CheckboxTreeNode[]) => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          allKeys.add(node.key);
          traverse(node.children);
        }
      }
    };
    traverse(textbooks);
    return allKeys;
  });

  // 自动展开选中节点的路径
  useEffect(() => {
    if (selectedKeys.size > 0) {
      const keysToExpand = new Set<string>();

      const findPath = (nodes: CheckboxTreeNode[], targetKey: string): boolean => {
        for (const node of nodes) {
          if (node.key === targetKey) return true;
          if (node.children) {
            const found = findPath(node.children, targetKey);
            if (found) {
              keysToExpand.add(node.key);
              return true;
            }
          }
        }
        return false;
      };

      selectedKeys.forEach((key) => {
        findPath(textbooks, key);
      });

      setExpandedKeys((prev) => new Set([...prev, ...keysToExpand]));
    }
  }, [selectedKeys, textbooks]);

  // 切换节点选中（递归处理子节点）
  const toggleNodeSelect = useCallback(
    (node: CheckboxTreeNode, checked: boolean) => {
      const newSelected = new Set(selectedKeys);

      const toggleRecursive = (currentNode: CheckboxTreeNode) => {
        if (checked) {
          newSelected.add(currentNode.key);
        } else {
          newSelected.delete(currentNode.key);
        }

        if (currentNode.children) {
          currentNode.children.forEach((child) => toggleRecursive(child));
        }
      };

      toggleRecursive(node);
      setSelectedKeys(newSelected);

      // 通知父组件
      const selected: CheckboxTreeNode[] = [];
      const collectSelected = (nodes: CheckboxTreeNode[]) => {
        for (const n of nodes) {
          if (newSelected.has(n.key)) {
            selected.push(n);
          }
          if (n.children) {
            collectSelected(n.children);
          }
        }
      };
      collectSelected(textbooks);
      onSelect?.(selected);
    },
    [selectedKeys, textbooks, onSelect],
  );

  // 全选/取消全选
  const toggleAll = useCallback(
    (checked: boolean) => {
      const newSelected = new Set<string>();
      const traverse = (nodes: CheckboxTreeNode[]) => {
        for (const node of nodes) {
          if (checked) {
            newSelected.add(node.key);
          }
          if (node.children) {
            traverse(node.children);
          }
        }
      };
      traverse(textbooks);
      setSelectedKeys(newSelected);

      const selected: CheckboxTreeNode[] = [];
      const collectSelected = (nodes: CheckboxTreeNode[]) => {
        for (const n of nodes) {
          if (newSelected.has(n.key)) {
            selected.push(n);
          }
          if (n.children) {
            collectSelected(n.children);
          }
        }
      };
      collectSelected(textbooks);
      onSelect?.(selected);
    },
    [textbooks, onSelect],
  );

  const selectedCount = selectedKeys.size;

  // 计算总节点数
  const totalCount = useMemo(() => {
    let count = 0;
    const traverse = (nodes: CheckboxTreeNode[]) => {
      for (const node of nodes) {
        count++;
        if (node.children) {
          traverse(node.children);
        }
      }
    };
    traverse(textbooks);
    return count;
  }, [textbooks]);

  // 切换所有节点的展开状态
  const toggleAllExpand = useCallback(() => {
    const allKeys = new Set<string>();
    const traverse = (nodes: CheckboxTreeNode[]) => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          allKeys.add(node.key);
          traverse(node.children);
        }
      }
    };
    traverse(textbooks);

    // 如果所有节点都已展开，则全部折叠；否则全部展开
    const allExpanded = Array.from(allKeys).every((key) => expandedKeys.has(key));
    if (allExpanded) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(allKeys);
    }
  }, [textbooks, expandedKeys]);

  return (
    <div className="w-full">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between mb-4 p-2 border bg-background">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">已选 {selectedCount} 项</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={toggleAllExpand}>
            全部展开/折叠
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              const allSelected = selectedCount === totalCount;
              toggleAll(!allSelected);
            }}
          >
            {selectedCount === totalCount ? '取消全选' : '全选'}
          </Button>
        </div>
      </div>

      {/* 树形结构 */}
      {textbooks.length > 0 && (
        <div className="border p-2 max-h-150 overflow-y-auto">
          {renderTreeNodes(
            textbooks,
            0,
            maxDepth,
            selectedKeys,
            expandedKeys,
            (key) => {
              setExpandedKeys((prev) => {
                const next = new Set(prev);
                if (next.has(key)) {
                  next.delete(key);
                } else {
                  next.add(key);
                }
                return next;
              });
            },
            toggleNodeSelect,
            (node) => {
              // 点击叶子节点快速选择
              if (!node.children || node.children.length === 0) {
                toggleNodeSelect(node, !selectedKeys.has(node.key));
              }
            },
          )}
        </div>
      )}
    </div>
  );
}

export type { LevelProps, CheckboxTreeNode };
export { ChapterExpandNav, ChapterTreeCheckboxNav };
