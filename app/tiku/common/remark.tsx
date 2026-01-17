import React from "react";
import {Alert, Button, Col, Flex, Row} from "antd";
import type {EditRemark} from "~/type/edit";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";
import {SimpleTextArea} from "~/tiku/common/text-area";

interface AddRemarkProps {
  val: string;
  setVal: (value: string) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加备注样式
export function AddRemarkInfoStyle(props: AddRemarkProps) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-2.5 font-bold">备注</div>
      {<SimpleTextArea
        name="remark"
        value={props.val}
        onChange={props.setVal}
        placeholder="请输入备注"
        autoSize={{minRows: 3, maxRows: 7}}
        onStartEdit={props.onStartEdit}
      />}
    </Col>
  </Row>
}

interface EditRemarkProps {
  val: string;
  setVal: (value: string) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑备注样式
export function EditRemarkInfoStyle(props: EditRemarkProps) {
  const [showEditRemark, setShowEditRemark] = React.useState(false);
  const [showEditRemarkErr, setShowEditRemarkErr] = React.useState<React.ReactNode>("");

  const updateRemarkVal = () => {
    const req: EditRemark = {
      id: props.id,
      remark: props.val,
    }
    httpClient.post("/edit/remark", req).then((res) => {
      setShowEditRemarkErr("");
      setShowEditRemark(false);
      props.setRefreshListNum(StringUtil.getRandomInt());
    }).catch((err) => {
      setShowEditRemarkErr(<div>
        <Alert title={`更新备注出错: ${err.message}`} type="error"/>
      </div>);
    })
  }

  const showEditRemarkArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateRemarkVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {<AddRemarkInfoStyle
        val={props.val}
        setVal={props.setVal}
        onStartEdit={setShowEditRemark}
      />}
    </div>
    {showEditRemarkErr}
    {showEditRemark && showEditRemarkArea}
  </div>
}
