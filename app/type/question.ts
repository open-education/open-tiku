export interface QuestionType {
    label: string
    key: string
    order: number
}

export interface QuestionInfo {
    id: string,
    textbookKey: string,
    catalogKey: string,
    questionType: string,
    tags?: string[],
    rateVal?: string,
    titleVal: string,
    mentionVal?: string,
    imageNames?: string[],
    showImageVal?: string,
    aVal?: string,
    bVal?: string,
    cVal?: string,
    dVal?: string,
    eVal?: string,
    showSelectVal?: string,
    answerVal?: string,
    knowledgeVal?: string,
    analyzeVal?: string,
    processVal?: string,
    remarkVal?: string,
}

export interface QuestionUploadReq {
    textbookKey: string,
    catalogKey: string,
    sourceId?: string,
    questionType: string,
    tags?: string[],
    rateVal?: string,
    titleVal: string,
    mentionVal?: string,
    imageNames?: string[],
    showImageVal?: string,
    aVal?: string,
    bVal?: string,
    cVal?: string,
    dVal?: string,
    eVal?: string,
    showSelectVal?: string,
    answerVal?: string,
    knowledgeVal?: string,
    analyzeVal?: string,
    processVal?: string,
    remarkVal?: string,
}

export interface QuestionUploadResp {
    id: string,
}

export interface QuestionListReq {
    textbookKey: string,
    catalogKey: string,
    pageNo: number,
    pageSize: number
}

export interface QuestionListResp {
    pageNo: number,
    pageSize: number
    total: number
    data: QuestionInfo[]
}