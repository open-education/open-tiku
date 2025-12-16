export class HierarchicalDict<T extends { key: string; children?: T[] }> {
  private dict: Map<number, Record<string, T>> = new Map();
  private readonly maxDepth: number = 0;

  constructor(items: T[], maxDepth: number = 3) {
    this.maxDepth = maxDepth;
    this.buildDict(items);
  }

  private buildDict(items: T[], currentDepth: number = 1, parentKeys: string[] = []): void {
    if (currentDepth > this.maxDepth) return;

    items.forEach(item => {
      const currentKey = [...parentKeys, item.key].join('_');

      // 初始化当前深度的字典
      if (!this.dict.has(currentDepth)) {
        this.dict.set(currentDepth, {});
      }

      // 存储到对应深度的字典
      const dict = this.dict.get(currentDepth)!;
      dict[currentKey] = item;

      // 递归处理子项
      if (item.children && item.children.length > 0) {
        this.buildDict(item.children, currentDepth + 1, [...parentKeys, item.key]);
      }
    });
  }

  /**
   * 获取指定层级的项
   * @param depth 层级（从1开始）
   * @param keys 从根到当前层的所有key
   */
  get(depth: number, ...keys: string[]): T | undefined {
    if (keys.length !== depth) {
      throw new Error(`Keys count (${keys.length}) must match depth (${depth})`);
    }

    const dict = this.dict.get(depth);
    if (!dict) return undefined;

    const fullKey = keys.join('_');
    return dict[fullKey];
  }

  /**
   * 获取第一层项
   */
  getFirst(key: string): T | undefined {
    return this.get(1, key);
  }

  /**
   * 获取第二层项
   */
  getSecond(firstKey: string, secondKey: string): T | undefined {
    return this.get(2, firstKey, secondKey);
  }

  /**
   * 获取第三层项
   */
  getThird(firstKey: string, secondKey: string, thirdKey: string): T | undefined {
    return this.get(3, firstKey, secondKey, thirdKey);
  }

  /**
   * 清空字典
   */
  clear(): void {
    this.dict.clear();
  }
}
