export interface CustomTextbook {
  fifth?: number; // 是否选择了第5层菜单, 用户展开题型列表
  fifthKeys?: string[]; // 前5层菜单 key
  eightKeys?: string[]; // 后3层菜单 ids
}

// 个性化信息保存
export interface CustomReq {
  id?: number;
  customType: number;
  textbook?: CustomTextbook;
}

// 个性化信息返回
export interface CustomResp {
  id: number;
  customType: number;
  textbook?: CustomTextbook;
}
