import React from "react";
import {Alert, Button, Col, Flex, Rate, Row} from "antd";
import type {EditRate} from "~/type/edit";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";

interface RateProps {
  val: number;
  setVal: (value: number) => void;
  onStartEdit?: (value: boolean) => void;
}

export function RateInfo(props: RateProps) {
  const onEditRateChange = (val: number) => {
    props.setVal(val);
    props.onStartEdit?.(true);
  };

  return <Rate allowHalf defaultValue={props.val} onChange={onEditRateChange}/>
}

interface AddRateProps {
  val: number;
  setVal: (val: number) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加题目难度样式
export function AddRateInfoStyle(props: AddRateProps) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-2.5 font-bold">难易程度</div>
      {<RateInfo val={props.val} setVal={props.setVal} onStartEdit={props.onStartEdit}/>}
    </Col>
  </Row>
}

interface EditRateProps {
  val: number;
  setVal: (val: number) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑题目难度样式
export function EditRateInfoStyle(props: EditRateProps) {
  const [showEditRate, setShowEditRate] = React.useState(false);
  const [showEditRateErr, setShowEditRateErr] = React.useState<React.ReactNode>("");

  const updateRateVal = () => {
    const req: EditRate = {
      id: props.id,
      difficultyLevel: props.val,
    }
    httpClient.post("/edit/rate", req).then(res => {
      setShowEditRateErr("")
      setShowEditRate(false);
      props.setRefreshListNum(StringUtil.getRandomInt());
    }).catch(err => {
      setShowEditRateErr(<div>
        <Alert title={`更新评分出错: ${err.message}`} type={"error"}/>
      </div>);
    })
  }

  const showEditRateArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateRateVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {<AddRateInfoStyle val={props.val} setVal={props.setVal} onStartEdit={setShowEditRate}/>}
    </div>
    {showEditRateErr}
    {showEditRate && showEditRateArea}
  </div>
}
