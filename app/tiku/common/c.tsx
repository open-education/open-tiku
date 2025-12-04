import React, {useCallback} from "react";
import {Button, Col, Flex, Input, Row} from "antd";

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
        placeholder="C选项内容"
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
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">B</div>
            {CInfo(cVal, setCVal, setShowEditC)}
        </Col>
    </Row>
}

export function EditCInfoStyle(
    cVal: string,
    setCVal: React.Dispatch<React.SetStateAction<string>>,
) {

    const [showEditC, setShowEditC] = React.useState(false);

    const updateCVal = () => {
        alert("Upload success: " + cVal);
        setShowEditC(false);
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
        {showEditC && showEditCArea}
    </div>
}
