import { CustomPageSource, type CustomUserSource } from '@/type/enum';

export interface CustomTextbook {
  fifth?: number; // 是否选择了第5层菜单, 用户展开题型列表
  fifthKeys?: string[]; // 前5层菜单 key
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
