import { ChapterExpandNav, ChapterTreeCheckboxNav, type CheckboxTreeNode, type LevelProps } from '@/common/nav';
import { SearchList } from '@/components/question/nav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { QuestionSearch } from '@/type/question';
import type { OtherDictListRecord, TextbookResp } from '@/type/textbook';
import { BookOpen, ChevronDown, Filter, Layers, RotateCcw, SlidersHorizontal } from 'lucide-react';

// 题目筛选条件
interface FilterListProps {
  textbooks: TextbookResp[];
  questionCates: CheckboxTreeNode[];
  otherDictListRecord: OtherDictListRecord;
  questionSearch: QuestionSearch;
  onTextbook: (selection: LevelProps, selectedTextbooks: Record<keyof LevelProps, TextbookResp | null>) => void;
  onQuestionCate: (selectedItems: CheckboxTreeNode[]) => void;
  updateQuestionSearch: (key: keyof QuestionSearch, value: number | number[] | string[]) => void;
}

export default function FilterList({
  textbooks,
  questionCates,
  otherDictListRecord,
  questionSearch,
  onTextbook,
  onQuestionCate,
  updateQuestionSearch,
}: FilterListProps) {
  const selectedChapter = '小学 / 初中 / 数学 / 章节选题 / 七年级数学上册';
  const selectedType = '题型1';
  const selectedOther = '选择题等';

  const hasAnyFilter = Boolean(selectedChapter || selectedType || selectedOther);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-none border border-border bg-card px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-8 items-center gap-2 pr-1 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          <Filter className="h-3.5 w-3.5 text-foreground" />
          <span>筛选条件</span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* 章节/知识点 已选中态：实线深色描边 + 内部竖线分割键值 */}
        <Dialog>
          <DialogTrigger
            render={
              <button
                type="button"
                className="group flex h-8 items-center rounded-none border border-foreground/40 bg-background text-xs transition-colors hover:border-foreground"
              >
                <span className="flex h-full items-center gap-1.5 bg-muted/50 px-2.5 font-medium text-muted-foreground group-hover:text-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  章节/知识点
                </span>
                <span className="h-full w-px bg-border" />
                <span className="flex h-full max-w-40 items-center gap-1.5 px-2.5 font-semibold text-foreground">
                  <span className="truncate">{selectedChapter || '全部'}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </span>
              </button>
            }
          />
          <DialogContent className="rounded-none w-[95vw] sm:max-w-150 max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">选择章节 / 知识点</DialogTitle>
              <DialogDescription>请勾选需要筛选的学段、教材章节或知识点</DialogDescription>
            </DialogHeader>

            <ChapterExpandNav textbooks={textbooks} onSelectionChange={onTextbook} />

            <Separator />

            <DialogFooter>
              <DialogClose render={<Button variant="outline">关闭</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 题型 未选中态：虚线/浅灰边框 */}
        <Dialog>
          <DialogTrigger
            render={
              <button
                type="button"
                className="group flex h-8 items-center rounded-none border border-border bg-background text-xs transition-colors hover:border-foreground/50"
              >
                <span className="flex h-full items-center gap-1.5 px-2.5 font-medium text-muted-foreground group-hover:text-foreground">
                  <Layers className="h-3.5 w-3.5" />
                  题型
                </span>
                <span className="h-3.5 w-px bg-border" />
                <span className="flex h-full items-center gap-1.5 px-2.5 text-muted-foreground">
                  <span>{selectedType || '全部'}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                </span>
              </button>
            }
          />
          <DialogContent className="rounded-none w-[95vw] sm:max-w-150 max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">选择题型</DialogTitle>
              <DialogDescription>选择需要指定的题型</DialogDescription>
            </DialogHeader>

            <ChapterTreeCheckboxNav textbooks={questionCates} onSelect={onQuestionCate} maxDepth={3} />

            <Separator />

            <DialogFooter>
              <DialogClose render={<Button variant="outline">关闭</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 其它条件 */}
        <Dialog>
          <DialogTrigger
            render={
              <button
                type="button"
                className="group flex h-8 items-center rounded-none border border-border bg-background text-xs transition-colors hover:border-foreground/50"
              >
                <span className="flex h-full items-center gap-1.5 px-2.5 font-medium text-muted-foreground group-hover:text-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  其它条件
                </span>
                <span className="h-3.5 w-px bg-border" />
                <span className="flex h-full items-center gap-1.5 px-2.5 text-muted-foreground">
                  <span>{selectedOther || '默认'}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                </span>
              </button>
            }
          />
          <DialogContent className="rounded-none w-[95vw] sm:max-w-300 max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">其它筛选条件</DialogTitle>
              <DialogDescription>按分层体系、核心素养、适用场景、标签和常见错误等筛选</DialogDescription>
            </DialogHeader>

            <SearchList otherDictListRecord={otherDictListRecord} questionSearch={questionSearch} updateQuestionSearch={updateQuestionSearch} />

            <Separator />

            <DialogFooter>
              <DialogClose render={<Button variant="outline">关闭</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 重置按钮 */}
      {hasAnyFilter && (
        <Button variant="ghost" size="sm" className="h-8 rounded-none px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          重置筛选
        </Button>
      )}
    </div>
  );
}
