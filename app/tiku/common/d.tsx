import React, {useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {EditD} from "~/type/edit";
import type {QuestionInfo} from "~/type/question";
import {httpClient} from "~/util/http";

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
        placeholder="请输入D选项内容, 包括 D"
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
    questionInfo: QuestionInfo
) {
    const [showEditD, setShowEditD] = React.useState(false);
    const [showEditDErr, setShowEditDErr] = React.useState<React.ReactNode>("");

    const updateDVal = () => {
        const req: EditD = {
            textbookKey: questionInfo.textbookKey,
            catalogKey: questionInfo.catalogKey,
            id: questionInfo.id,
            d: dVal,
        }
        httpClient.post("/edit/d", req).then((res) => {
            setShowEditDErr("");
            setShowEditD(false);
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
