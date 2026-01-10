import React, {type Dispatch, type SetStateAction, useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {EditC} from "~/type/edit";
import type {QuestionBaseInfoResp, QuestionInfo_del} from "~/type/question";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";

const {TextArea} = Input;

export function CInfo(
  cVal: string,
  setCVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditC?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const onEditCChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCVal(e.target.value);
      if (setShowEditC) {
        setShowEditC(true);
      }
    },
    []
  );

  return <TextArea
    autoSize={{minRows: 2, maxRows: 5}}
    placeholder="请输入C选项内容"
    onChange={onEditCChange}
    name="C"
    value={cVal}
  />
}

export function AddCInfoStyle(
  cVal: string,
  setCVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditC?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-[10px] font-bold">C</div>
      {CInfo(cVal, setCVal, setShowEditC)}
    </Col>
  </Row>
}

export function EditCInfoStyle(
  cVal: string,
  setCVal: React.Dispatch<React.SetStateAction<string>>,
  questionInfo: QuestionBaseInfoResp,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  const [showEditC, setShowEditC] = React.useState(false);
  const [showEditCErr, setShowEditCErr] = React.useState<React.ReactNode>("");

  const updateCVal = () => {
    // const req: EditC = {
    //   textbookKey: questionInfo.textbookKey,
    //   catalogKey: questionInfo.catalogKey,
    //   id: questionInfo.id,
    //   c: cVal,
    // }
    // httpClient.post("/edit/c", req).then((res) => {
    //   setShowEditCErr("");
    //   setShowEditC(false);
    //   setRefreshListNum(StringUtil.getRandomInt());
    // }).catch((err) => {
    //   setShowEditCErr(<div>
    //     <Alert title={`更新C选项出错: ${err.message}`} type={"error"}/>
    //   </div>);
    // })
  }

  const showEditCArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateCVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {AddCInfoStyle(cVal, setCVal, setShowEditC)}
    </div>
    {showEditCErr}
    {showEditC && showEditCArea}
  </div>
}
