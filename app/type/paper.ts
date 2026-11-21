// 试卷添加请求
import { ExamType, PaperDifficultyType, PaperLevelType, PaperPageSource, PaperType, UploadFileType } from '@/type/enum';

// 文件信息
export interface FileInfo {
  id: number;
  name: string;
  url: string;
  size: number;
}

export interface PaperAddReq {
  id?: number;
  textbookPath: string; // 菜单完整路径
  paperType: PaperType; // 试卷类型: 1 上传试卷, 2 手动组卷 (默认 1)
  fileType: UploadFileType; // 文件类型: 0 无意义, 1 PDF 文件, 2 Word 文件, 3 图片, 4 Markdown 文档
  fileList?: FileInfo[]; // 文件信息
  provinceId?: number; // 省标识
  cityId?: number; // 城市标识
  schoolName?: string; // 学校名称
  examType: ExamType; // 标签
  year: string; // 年份
  grade?: string; // 年级, 七年级
  semester?: string; // 学期
  title: string; // 试卷标题
  score?: number; // 总分 (默认 0)
  duration?: number; // 时长，单位：秒
  levelType?: PaperLevelType; // 试卷级别类型: 1 普通, 2 精品 (默认 1)
  difficultyType?: PaperDifficultyType; // 难度类型: 1 容易, 2 适中, 3 困难 (默认 1)
  source?: string; // 来源，需要记录试卷来源
  remark?: string; // 试卷备注
  count?: number; // 小题数量
  status: number; // 试卷状态
}

// 试卷计数信息
export interface CountPaperResp {
  status: number;
  count: number;
}

// 试卷搜索
export interface PaperListReq {
  source: PaperPageSource;
  textbookPath: string;
  year?: string;
  examType?: number;
  levelType?: number;
  difficultyType?: number;
  provinceId?: number;
  cityId?: number;
  schoolName?: string;
  status?: number;
  pageNo: number;
  pageSize: number;
}

// 试卷返回基本信息
export interface PaperResp {
  id: number;
  textbookPath: string; // 菜单层级信息
  paperType: PaperType; // 试卷类型: 1 上传试卷, 2 手动组卷 (默认 1)
  fileType: UploadFileType; // 文件类型: 0 无意义, 1 PDF 文件, 2 Word 文件, 3 图片, 4 Markdown 文档
  fileList: FileInfo[]; // 文件地址信息
  provinceId?: number; // 省标识
  cityId?: number; // 城市标识
  schoolName?: string; // 学校名称
  examType: ExamType; // 标签
  year: string; // 年份
  grade?: string; // 年级, 七年级
  semester?: string; // 学期
  title: string; // 试卷标题
  score?: number; // 总分 (默认 0)
  duration?: number; // 时长，单位：秒
  levelType?: PaperLevelType; // 试卷级别类型: 1 普通, 2 精品 (默认 1)
  difficultyType?: PaperDifficultyType; // 难度类型: 1 容易, 2 适中, 3 困难 (默认 1)
  source?: string; // 来源，需要记录试卷来源
  remark?: string; // 试卷备注
  count?: number; // 小题数量
  status: number; // 试卷状态
  authorId: number;
  authorName: string;
  approveId?: number;
  approveName: string;
  rejectReason?: string;
  approveAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 试卷列表信息
export interface PaperListResp {
  list: PaperResp[];
  pageNo: number;
  pageSize: number;
  total: number;
}

// 试卷审核
export interface PaperApproveReq {
  id: number;
  status: number; // 审核状态
  rejectReason: string; // 拒绝原因
}

// 试卷删除
export interface PaperDeleteReq {
  id: number;
}
