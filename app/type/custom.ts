import { CustomPageSource, type CustomUserSource } from '@/type/enum';

export interface CustomTextbook {
  mode?: number; // 1 是章节 2 是知识点, 通用模式前2层默认章节
  path?: string; // 完整路径标识
  keys?: string[]; // 完整路径 key 集合
}

// 个性化信息保存
export interface CustomAddReq {
  id?: number;
  userSource: CustomUserSource;
  customType: number;
  textbook?: CustomTextbook;
}

// 个性化信息返回
export interface CustomResp {
  id: number;
  customType: number;
  textbook?: CustomTextbook;
}

// 个性化信息查询
export interface CustomListReq {
  userSource: CustomUserSource;
  pageSource: CustomPageSource;
}
