export interface KnowledgeInfo {
    key: string;
    label: string;
    order: number,
    children?: KnowledgeInfo[];
}