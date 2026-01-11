import React, {type Dispatch, type SetStateAction, useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {EditOption} from "~/type/edit";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";

const {TextArea} = Input;

export function DInfo(
  dVal: string,
  setDVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditD?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const onEditDChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDVal(e.target.value);
      if (setShowEditD) {
        setShowEditD(true);
      }
    },
    []
  );

  return <TextArea
    autoSize={{minRows: 2, maxRows: 5}}
    placeholder="请输入D选项内容"
    onChange={onEditDChange}
    name="D"
    value={dVal}
  />
}

export function AddDInfoStyle(
  dVal: string,
  setDVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditD?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-[10px] font-bold">D</div>
      {DInfo(dVal, setDVal, setShowEditD)}
    </Col>
  </Row>
}

export function EditDInfoStyle(
  dVal: string,
  setDVal: React.Dispatch<React.SetStateAction<string>>,
  id: number,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  const [showEditD, setShowEditD] = React.useState(false);
  const [showEditDErr, setShowEditDErr] = React.useState<React.ReactNode>("");

  const updateDVal = () => {
    const req: EditOption = {
      id,
      option: {
        label: "D",
        content: dVal,
        order: 4
      },
    }
    httpClient.post("/edit/options", req).then((res) => {
      setShowEditDErr("");
      setShowEditD(false);
      setRefreshListNum(StringUtil.getRandomInt());
    }).catch(err => {
      setShowEditDErr(<div>
        <Alert title={`更新D选项出错: ${err.message}`} type={"error"}/>
      </div>);
    })
  }

  const showEditDArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateDVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {AddDInfoStyle(dVal, setDVal, setShowEditD)}
    </div>
    {showEditDErr}
    {showEditD && showEditDArea}
  </div>
}
