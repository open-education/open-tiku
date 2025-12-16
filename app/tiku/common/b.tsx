import React, {type Dispatch, type SetStateAction, useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {EditB} from "~/type/edit";
import {httpClient} from "~/util/http";
import type {QuestionInfo} from "~/type/question";
import {StringUtil} from "~/util/string";

const {TextArea} = Input;

export function BInfo(
  bVal: string,
  setBVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditB?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const onEditBChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setBVal(e.target.value);
      if (setShowEditB) {
        setShowEditB(true);
      }
    },
    []
  );

  return <TextArea
    autoSize={{minRows: 2, maxRows: 5}}
    placeholder="请输入B选项内容, 包括 B"
    onChange={onEditBChange}
    name="B"
    value={bVal}
  />
}

export function AddBInfoStyle(
  bVal: string,
  setBVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditB?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-[10px] font-bold">B</div>
      {BInfo(bVal, setBVal, setShowEditB)}
    </Col>
  </Row>
}

export function EditBInfoStyle(
  bVal: string,
  setBVal: React.Dispatch<React.SetStateAction<string>>,
  questionInfo: QuestionInfo,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {

  const [showEditB, setShowEditB] = React.useState(false);
  const [showEditBErr, setShowEditBErr] = React.useState<React.ReactNode>("");

  const updateBVal = () => {
    const req: EditB = {
      textbookKey: questionInfo.textbookKey,
      catalogKey: questionInfo.catalogKey,
      id: questionInfo.id,
      b: bVal,
    }
    httpClient.post("/edit/b", req).then(res => {
      setShowEditBErr("");
      setShowEditB(false);
      setRefreshListNum(StringUtil.getRandomInt());
    }).catch(err => {
      setShowEditBErr(<div>
        <Alert title={`更新B选项出错: ${err.message}`} type={"error"}/>
      </div>);
    })
  }

  const showEditBArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateBVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {AddBInfoStyle(bVal, setBVal, setShowEditB)}
    </div>
    {showEditBErr}
    {showEditB && showEditBArea}
  </div>
}
