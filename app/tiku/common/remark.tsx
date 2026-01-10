import React, {type Dispatch, type SetStateAction, useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {QuestionBaseInfoResp, QuestionInfo_del} from "~/type/question";
import type {EditRemark} from "~/type/edit";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";

const {TextArea} = Input;

export function RemarkInfo(
  remarkVal: string,
  setRemarkVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditRemark?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const onEditRemarkChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRemarkVal(e.target.value);
      if (setShowEditRemark) {
        setShowEditRemark(true);
      }
    },
    []
  );

  return <TextArea
    autoSize={{minRows: 3, maxRows: 7}}
    placeholder="请输入备注"
    onChange={onEditRemarkChange}
    name="remark"
    value={remarkVal}
  />
}

export function AddRemarkInfoStyle(
  remarkVal: string,
  setRemarkVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditRemark?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-[10px] font-bold">备注</div>
      {RemarkInfo(remarkVal, setRemarkVal, setShowEditRemark)}
    </Col>
  </Row>
}

export function EditRemarkInfoStyle(
  remarkVal: string,
  setRemarkVal: React.Dispatch<React.SetStateAction<string>>,
  questionInfo: QuestionBaseInfoResp,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  const [showEditRemark, setShowEditRemark] = React.useState(false);
  const [showEditRemarkErr, setShowEditRemarkErr] = React.useState<React.ReactNode>("");

  const updateRemarkVal = () => {
    // const req: EditRemark = {
    //   textbookKey: questionInfo.textbookKey,
    //   catalogKey: questionInfo.catalogKey,
    //   id: questionInfo.id,
    //   remark: remarkVal,
    // }
    // httpClient.post("/edit/remark", req).then((res) => {
    //   setShowEditRemarkErr("");
    //   setShowEditRemark(false);
    //   setRefreshListNum(StringUtil.getRandomInt());
    // }).catch((err) => {
    //   setShowEditRemarkErr(<div>
    //     <Alert title={`更新备注出错: ${err.message}`} type="error"/>
    //   </div>);
    // })
  }

  const showEditRemarkArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateRemarkVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {AddRemarkInfoStyle(remarkVal, setRemarkVal, setShowEditRemark)}
    </div>
    {showEditRemarkErr}
    {showEditRemark && showEditRemarkArea}
  </div>
}
