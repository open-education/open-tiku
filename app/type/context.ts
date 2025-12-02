import type {QuestionType} from "~/type/question";
import type {TagInfo} from "~/type/tag";
import type {Subject} from "~/type/guidance";
import type {Catalog} from "~/type/catalog";

export interface TiKuIndexContext {
    textbookKey: string;
    catalogKey: string;
    catalogKeyChange: number, // 变化时生成一个随机数, 如果相同暂时不关心
    subjectList: Subject[],
    catalogList: Catalog[],
    questionTypeList: QuestionType[],
    tagList: TagInfo[],
}
