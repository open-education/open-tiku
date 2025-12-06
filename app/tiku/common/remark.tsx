import React, {useCallback} from "react";
import {Button, Col, Flex, Input, Row} from "antd";

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
) {

    const [showEditRemark, setShowEditRemark] = React.useState(false);

    const updateRemarkVal = () => {
        alert("Upload success: " + remarkVal);
        setShowEditRemark(false);
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
        {showEditRemark && showEditRemarkArea}
    </div>
}
