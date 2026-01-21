// 教材章节字典相关属性
export interface Textbook {
  id: number;
  parentId: number;
  label: string;
  key: string;
  sortOrder: number;
  pathDepth: number;
  children?: Textbook[];
}

// 教材章节其它字典
export interface TextbookOtherDict {
  id: number;
  textbookId: number;
  typeCode: string;
  itemValue: string;
  sortOrder: number;
  isSelect: boolean;
}

// 选择父级菜单时下拉列表数据结构
export interface TextbookOption {
  label: string;
  value: string;
  raw: Textbook;
  children?: TextbookOption[];
}
