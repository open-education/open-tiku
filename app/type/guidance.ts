export interface Textbook {
    label: string,
    key: string,
    order: number,
}

export interface Stage {
    label: string,
    key: string,
    order: number,
    children?: Textbook[],
}

export interface Subject {
    label: string,
    key: string,
    order: number,
    children?: Stage[],
}

export interface Publisher {
    label: string,
    key: string,
    order: number,
    children?: Subject[],
}
