import React from "react";
import {Button, Col, Flex, Rate, Row} from "antd";

export function RateInfo(
    rateVal: number,
    setRateVal: React.Dispatch<React.SetStateAction<number>>,
    setShowEditRate ?: React.Dispatch<React.SetStateAction<boolean>>,
) {

    const onEditRateChange = (val: number) => {
        setRateVal(val);
        if (setShowEditRate) {
            setShowEditRate(true);
        }
    };

    return <Rate allowHalf defaultValue={rateVal} onChange={onEditRateChange}/>
}

export function AddRateInfoStyle(
    rateVal: number,
    setRateVal: React.Dispatch<React.SetStateAction<number>>,
    setShowEditRate ?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">难易程度</div>
            {RateInfo(rateVal, setRateVal, setShowEditRate)}
        </Col>
    </Row>
}

export function EditRateInfoStyle(
    rateVal: number,
    setRateVal: React.Dispatch<React.SetStateAction<number>>
) {
    const [showEditRate, setShowEditRate] = React.useState(false);

    const updateRateVal = () => {
        alert("Upload success: " + rateVal);
        setShowEditRate(false);
    }

    const showEditRateArea = <div className="mt-2.5">
        <Flex gap="small" wrap justify={"right"}>
            <Button color="cyan" variant="dashed" onClick={updateRateVal}>更新</Button>
        </Flex>
    </div>

    return <div className="p-2.5 hover:border border-red-700 border-dashed">
        <div>
            {AddRateInfoStyle(rateVal, setRateVal, setShowEditRate)}
        </div>
        {showEditRate && showEditRateArea}
    </div>
}
