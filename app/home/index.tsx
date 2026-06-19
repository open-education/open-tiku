import { ArrowRight, Upload, GraduationCap } from "lucide-react";
import { ChapterExpandNav } from "~/common/nav";
import { Button } from "~/components/ui/button";
import type { Textbook } from "~/type/textbook";

// 网站首页
export default function Index(props: any) {
  const textbooks: Textbook[] = props.textbooks ?? [];

  // 操作区域
  const actions = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
      <div className="flex gap-2.5 shrink-0">
        <Button variant="outline" size="lg" onClick={() => {}}>
          <Upload size={14} />
          上传视频
        </Button>
        <Button variant="outline" size="lg" onClick={() => {}}>
          <Upload size={14} />
          上传试卷
        </Button>
        <Button variant="outline" size="lg" onClick={() => {}}>
          <Upload size={14} />
          上传题目
        </Button>
        <Button variant="default" size="lg" onClick={() => {}}>
          <GraduationCap size={14} />
          开始练题
          <ArrowRight size={13} />
        </Button>
      </div>
    </div>
  );

  return (
    <ChapterExpandNav
      textbooks={textbooks}
      onSelectionChange={(selection, selectedTextbooks) => {
        console.log(selection);
        console.log(selectedTextbooks);
      }}
      actions={actions}
    />
  );
}
