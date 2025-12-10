export interface Textbook {
    label: string,
    key: string,
    order: number,
}

export interface Knowledge {
    label: string,
    key: string,
    order: number,
}

export interface Stage {
    label: string,
    key: string,
    order: number,
    textbookList?: Textbook[],
    knowledgeList?: Knowledge[],
}

export interface Publisher {
    label: string,
    key: string,
    order: number,
    children?: Stage[],
}

export interface Subject {
    label: string,
    key: string,
    order: number,
    children?: Publisher[],
}
