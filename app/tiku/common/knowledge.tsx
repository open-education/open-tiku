import React, {type Dispatch, type SetStateAction, useCallback} from "react";
import {Button, Col, Flex, Input, Row} from "antd";
import type {QuestionBaseInfoResp} from "~/type/question";

const {TextArea} = Input;

export function KnowledgeInfo(
  knowledgeVal: string,
  setKnowledgeVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditKnowledge?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const onEditKnowledgeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setKnowledgeVal(e.target.value);
      if (setShowEditKnowledge) {
        setShowEditKnowledge(true);
      }
    },
    []
  );

  return <TextArea
    autoSize={{minRows: 3, maxRows: 7}}
    placeholder="请输入知识点"
    onChange={onEditKnowledgeChange}
    name="knowledge"
    value={knowledgeVal}
  />
}

export function AddKnowledgeInfoStyle(
  knowledgeVal: string,
  setKnowledgeVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditKnowledge?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-[10px] font-bold">知识点</div>
      {KnowledgeInfo(knowledgeVal, setKnowledgeVal, setShowEditKnowledge)}
    </Col>
  </Row>
}

export function EditKnowledgeInfoStyle(
  knowledgeVal: string,
  setKnowledgeVal: React.Dispatch<React.SetStateAction<string>>,
  questionInfo: QuestionBaseInfoResp,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  const [showEditKnowledge, setShowEditKnowledge] = React.useState(false);
  const [showEditKnowledgeErr, setShowEditKnowledgeErr] = React.useState<React.ReactNode>("");

  const updateKnowledgeVal = () => {
    // const req: EditKnowledge = {
    //   textbookKey: questionInfo.textbookKey,
    //   catalogKey: questionInfo.catalogKey,
    //   id: questionInfo.id,
    //   knowledge: knowledgeVal,
    // }
    // httpClient.post("/edit/knowledge", req).then((res) => {
    //   setShowEditKnowledgeErr("");
    //   setShowEditKnowledge(false);
    //   setRefreshListNum(StringUtil.getRandomInt());
    // }).catch((err) => {
    //   setShowEditKnowledgeErr(<div>
    //     <Alert title={`更新知识点出错: ${err.message}`} type="error"/>
    //   </div>);
    // })
  }

  const showEditKnowledgeArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateKnowledgeVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {AddKnowledgeInfoStyle(knowledgeVal, setKnowledgeVal, setShowEditKnowledge)}
    </div>
    {showEditKnowledgeErr}
    {showEditKnowledge && showEditKnowledgeArea}
  </div>
}
