import React, {useCallback} from "react";
import {Button, Col, Flex, Input, Row} from "antd";

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
        placeholder="D选项内容"
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
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">B</div>
            {DInfo(dVal, setDVal, setShowEditD)}
        </Col>
    </Row>
}

export function EditDInfoStyle(
    dVal: string,
    setDVal: React.Dispatch<React.SetStateAction<string>>,
) {

    const [showEditD, setShowEditD] = React.useState(false);

    const updateDVal = () => {
        alert("Upload success: " + dVal);
        setShowEditD(false);
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
        {showEditD && showEditDArea}
    </div>
}
