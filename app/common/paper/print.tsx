import { useRef } from 'react';
import type { GenPaperResp, TopPaperResp } from '~/type/paper';
import { useReactToPrint } from 'react-to-print';
import { StringConst } from '~/util/string';
import { TitleShow } from '~/common/title';
import { MultiOptionShow } from '~/common/select';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import type { QuestionOption } from '~/type/question';

// 普通的前端试卷打印pdf页面

// 生成题型样式
const getGroupName = (index: number, typeName: string, subTitle: string) => {
  const groupName = subTitle
    ? `${StringConst.groupNumberMap[index]}、${typeName} (${subTitle})`
    : `${StringConst.groupNumberMap[index]}、${typeName}`;
  return <div className="text-base">{groupName}</div>;
};

// 精选试卷和手动组卷对象归一化
interface NormalizedQuestion {
  id: string | number;
  orderNum: number;
  stem: string;
  images: string[];
  optionsLayout: number;
  options: QuestionOption[];
}

interface NormalizedGroup {
  id: string | number;
  typeName: string;
  subTitle: string;
  questions: NormalizedQuestion[];
}

interface ExportPdfProps {
  topInfoResp?: TopPaperResp; // 精选试卷
  genInfoResp?: GenPaperResp; // 手动组卷
}

// 精选试卷 -> 标准化
function normalizeTopPaper(resp: TopPaperResp): { title: string; groups: NormalizedGroup[] } {
  return {
    title: resp.common.title,
    groups: resp.groups.map((group) => ({
      id: group.common.id,
      typeName: group.common.typeName,
      subTitle: group.common.subTitle || '',
      questions: group.questions.map((q) => ({
        id: q.id,
        orderNum: q.orderNum,
        stem: q.stem,
        images: q.images || [],
        optionsLayout: q.optionsLayout || 1,
        options: q.options || [],
      })),
    })),
  };
}

// 手动组卷 -> 标准化
function normalizeGenPaper(resp: GenPaperResp): { title: string; groups: NormalizedGroup[] } {
  return {
    title: resp.common.title,
    groups: resp.groups.map((group) => ({
      id: group.common.genId,
      typeName: group.common.typeName,
      subTitle: group.common.subTitle || '',
      questions: group.questions.map((q) => ({
        id: q.common.genId,
        orderNum: q.common.orderNum,
        stem: q.info.baseInfo.title,
        images: q.info.baseInfo.images || [],
        optionsLayout: q.info.baseInfo.optionsLayout || 1,
        options: q.info.baseInfo.options || [],
      })),
    })),
  };
}

function ExportPdf({ topInfoResp, genInfoResp }: ExportPdfProps) {
  // 创建 ref 指向要打印的内容区域
  const printRef = useRef<HTMLDivElement>(null);

  // 确定标题
  let title = '试卷导出';
  let normalizedGroups: NormalizedGroup[] = [];

  // 将手动组卷和精选试卷数据结构进行处理
  if (topInfoResp && topInfoResp.common.id > 0) {
    const normalized = normalizeTopPaper(topInfoResp);
    title = normalized.title;
    normalizedGroups = normalized.groups;
  } else if (genInfoResp && genInfoResp.common.id > 0) {
    const normalized = normalizeGenPaper(genInfoResp);
    title = normalized.title;
    normalizedGroups = normalized.groups;
  }

  // 配置 react-to-print 钩子
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: title,
    pageStyle: `
      @page {
        margin: 20mm 15mm;
      }
      body {
        margin: 0;
      }
    `,
    onAfterPrint: () => {
      console.log('下载完成');
    },
  });

  // 打印当前组件详情
  const confirmExportPdf = () => {
    handlePrint();
  };

  return (
    <div className="flex flex-col gap-3 pl-4 pb-4 pr-4 bg-gray-100">
      <div className="mt-3">
        <Button onClick={confirmExportPdf} className="text-sm">
          确认下载
        </Button>
      </div>

      <div>
        <Separator />
      </div>

      {/* ---------- 要打印的内容区域 ---------- */}
      <div ref={printRef} className="px-4">
        {normalizedGroups.length > 0 ? <PdfContent title={title} groups={normalizedGroups} /> : <div>暂无内容</div>}
      </div>
    </div>
  );
}

function PdfContent({ title, groups }: { title: string; groups: NormalizedGroup[] }) {
  return (
    <>
      <div className="text-lg font-bold text-center">{title}</div>
      {groups.map((group, idx) => (
        <div key={group.id}>
          <div className="mt-2.5 mb-2.5 font-bold">{getGroupName(idx, group.typeName, group.subTitle)}</div>
          {group.questions.map((question) => (
            <div
              key={question.id}
              className="text-base mt-4 p-3 bg-white transition-all duration-200 hover:shadow-lg hover:border-primary/10 border-border/60"
            >
              <div className="pb-2">
                <div>
                  <TitleShow no={question.orderNum} title={question.stem} comment="" images={question.images} />
                </div>
                <div className="mt-2.5">
                  <MultiOptionShow optionsLayout={question.optionsLayout} options={question.options} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

export { getGroupName, ExportPdf };
