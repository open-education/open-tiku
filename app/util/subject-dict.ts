import type {Knowledge, Publisher, Stage, Subject, Textbook} from "~/type/guidance";

export class SubjectDict {
  private subjectDict: Record<string, Subject> = {};
  private publisherDict: Record<string, Publisher> = {};
  private stageDict: Record<string, Stage> = {};
  private textbookDict: Record<string, Textbook> = {};
  private knowledgeDict: Record<string, Textbook> = {};

  constructor(subjects: Subject[]) {
    this.buildDict(subjects);
  }

  private buildDict(subjects: Subject[]): void {
    subjects.forEach(subject => {
      // 添加到 subject 字典
      this.subjectDict[subject.key] = subject;

      // 处理 publisher
      if (subject.children) {
        subject.children.forEach(publisher => {
          const publisherKey = `${subject.key}_${publisher.key}`;
          this.publisherDict[publisherKey] = publisher;

          // 处理 stage
          if (publisher.children) {
            publisher.children.forEach(stage => {
              const stageKey = `${publisherKey}_${stage.key}`;
              this.stageDict[stageKey] = stage;

              // textbook
              if (stage.textbookList) {
                stage.textbookList.forEach(textbook => {
                  const textbookKey = `${stageKey}_${textbook.key}`;
                  this.textbookDict[textbookKey] = textbook;
                })
              }

              // knowledge
              if (stage.knowledgeList) {
                stage.knowledgeList.forEach(knowledge => {
                  const knowledgeKey = `${stageKey}_${knowledge.key}`;
                  this.knowledgeDict[knowledgeKey] = knowledge;
                })
              }
            });
          }
        });
      }
    });
  }

  // 查询方法
  getSubject(key: string): Subject | undefined {
    return this.subjectDict[key];
  }

  getPublisher(subjectKey: string, publisherKey: string): Publisher | undefined {
    return this.publisherDict[`${subjectKey}_${publisherKey}`];
  }

  getStage(subjectKey: string, publisherKey: string, stageKey: string): Stage | undefined {
    return this.stageDict[`${subjectKey}_${publisherKey}_${stageKey}`];
  }

  getTextbook(subjectKey: string, publisherKey: string, stageKey: string, textbookKey: string): Textbook | undefined {
    return this.textbookDict[`${subjectKey}_${publisherKey}_${stageKey}_${textbookKey}`];
  }

  getKnowledge(subjectKey: string, publisherKey: string, stageKey: string, knowledgeKey: string): Knowledge | undefined {
    return this.knowledgeDict[`${subjectKey}_${publisherKey}_${stageKey}_${knowledgeKey}`];
  }
}
