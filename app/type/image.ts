export interface DeleteImageReq {
  id?: number;
  filename: string;
}

// 文件上传返回
export interface UploadFileResp {
  originalName: string; // 原始文件名称
  size: number; // 文件尺寸
  name: string; // 文件标识
  url: string; // 文件标识, 目前这两个字段都是一样的值, 但是语义上 name 是服务端存储的文件名
}
