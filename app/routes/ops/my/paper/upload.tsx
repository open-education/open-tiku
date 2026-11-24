import Upload from '@/components/paper/upload';
import { ExamType, PaperDifficultyType, PaperLevelType, PaperStatus, PaperType, UploadFileType } from '@/type/enum';
import type { Route } from './+types/upload';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '上传试卷' },
    {
      name: 'description',
      content: '收集现有试卷上传至试卷中心',
    },
  ];
}

export default function Index() {
  return (
    <Upload
      key="paper-add"
      initAddReq={{
        textbookPath: '',
        paperType: PaperType.Upload,
        fileType: UploadFileType.Pdf,
        fileList: [],
        provinceId: 0,
        cityId: 0,
        examType: ExamType.UnitTest,
        schoolName: '',
        year: '',
        title: '',
        levelType: PaperLevelType.Standard,
        difficultyType: PaperDifficultyType.Easy,
        status: PaperStatus.Drafting,
        remark: '',
      }}
    />
  );
}
