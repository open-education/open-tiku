import React, {type Dispatch, type SetStateAction, useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {QuestionInfo} from "~/type/question";
import type {EditProcess} from "~/type/edit";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";

const {TextArea} = Input;

export function ProcessInfo(
    processVal: string,
    setProcessVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditProcess?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    const onEditProcessChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setProcessVal(e.target.value);
            if (setShowEditProcess) {
                setShowEditProcess(true);
            }
        },
        []
    );

    return <TextArea
        autoSize={{minRows: 3, maxRows: 7}}
        placeholder="请输入解题过程"
        onChange={onEditProcessChange}
        name="process"
        value={processVal}
    />
}

export function AddProcessInfoStyle(
    processVal: string,
    setProcessVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditProcess?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">解题过程</div>
            {ProcessInfo(processVal, setProcessVal, setShowEditProcess)}
        </Col>
    </Row>
}

export function EditProcessInfoStyle(
    processVal: string,
    setProcessVal: React.Dispatch<React.SetStateAction<string>>,
    questionInfo: QuestionInfo,
    setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
    const [showEditProcess, setShowEditProcess] = React.useState(false);
    const [showEditProcessErr, setShowEditProcessErr] = React.useState<React.ReactNode>("");

    const updateProcessVal = () => {
        const req: EditProcess = {
            textbookKey: questionInfo.textbookKey,
            catalogKey: questionInfo.catalogKey,
            id: questionInfo.id,
            process: processVal,
        }
        httpClient.post("/edit/process", req).then((res) => {
            setShowEditProcessErr("");
            setShowEditProcess(false);
            setRefreshListNum(StringUtil.getRandomInt());
        }).catch((err) => {
            setShowEditProcessErr(<div>
                <Alert title={`更新解题过程出错: ${err.message}`} type="error"/>
            </div>);
        })
    }

    const showEditProcessArea = <div className="mt-2.5">
        <Flex gap="small" wrap justify={"right"}>
            <Button color="cyan" variant="dashed" onClick={updateProcessVal}>更新</Button>
        </Flex>
    </div>

    return <div className="p-2.5 hover:border border-red-700 border-dashed">
        <div>
            {AddProcessInfoStyle(processVal, setProcessVal, setShowEditProcess)}
        </div>
        {showEditProcessErr}
        {showEditProcess && showEditProcessArea}
    </div>
}
