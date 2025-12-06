import React, {useCallback} from "react";
import {Button, Col, Flex, Input, Row} from "antd";

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
) {

    const [showEditB, setShowEditB] = React.useState(false);

    const updateBVal = () => {
        alert("Upload success: " + bVal);
        setShowEditB(false);
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
        {showEditB && showEditBArea}
    </div>
}
