import React, {useCallback} from "react";
import {Button, Col, Flex, Input, Row} from "antd";

const {TextArea} = Input;

export function AnalyzeInfo(
    analyzeVal: string,
    setAnalyzeVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditAnalyze?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    const onEditAnalyzeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setAnalyzeVal(e.target.value);
            if (setShowEditAnalyze) {
                setShowEditAnalyze(true);
            }
        },
        []
    );

    return <TextArea
        autoSize={{minRows: 3, maxRows: 7}}
        placeholder="请输入解题分析"
        onChange={onEditAnalyzeChange}
        name="analyze"
        value={analyzeVal}
    />
}

export function AddAnalyzeInfoStyle(
    analyzeVal: string,
    setAnalyzeVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditAnalyze?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">解题分析</div>
            {AnalyzeInfo(analyzeVal, setAnalyzeVal, setShowEditAnalyze)}
        </Col>
    </Row>
}

export function EditAnalyzeInfoStyle(
    analyzeVal: string,
    setAnalyzeVal: React.Dispatch<React.SetStateAction<string>>,
) {

    const [showEditAnalyze, setShowEditAnalyze] = React.useState(false);

    const updateAnalyzeVal = () => {
        alert("Upload success: " + analyzeVal);
        setShowEditAnalyze(false);
    }

    const showEditAnalyzeArea = <div className="mt-2.5">
        <Flex gap="small" wrap justify={"right"}>
            <Button color="cyan" variant="dashed" onClick={updateAnalyzeVal}>更新</Button>
        </Flex>
    </div>

    return <div className="p-2.5 hover:border border-red-700 border-dashed">
        <div>
            {AddAnalyzeInfoStyle(analyzeVal, setAnalyzeVal, setShowEditAnalyze)}
        </div>
        {showEditAnalyze && showEditAnalyzeArea}
    </div>
}
