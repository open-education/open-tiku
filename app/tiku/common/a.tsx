import React, {useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {EditA} from "~/type/edit";
import type {QuestionInfo} from "~/type/question";
import {httpClient} from "~/util/http";

const {TextArea} = Input;

export function AInfo(
    aVal: string,
    setAVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditA?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    const onEditAChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setAVal(e.target.value);
            if (setShowEditA) {
                setShowEditA(true);
            }
        },
        []
    );

    return <TextArea
        autoSize={{minRows: 2, maxRows: 5}}
        placeholder="请输入A选项内容, 包括 A"
        onChange={onEditAChange}
        name="A"
        value={aVal}
    />
}

export function AddAInfoStyle(
    aVal: string,
    setAVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditA?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">A</div>
            {AInfo(aVal, setAVal, setShowEditA)}
        </Col>
    </Row>
}

export function EditAInfoStyle(
    aVal: string,
    setAVal: React.Dispatch<React.SetStateAction<string>>,
    questionInfo: QuestionInfo,
) {
    const [showEditA, setShowEditA] = React.useState(false);
    const [showEditAErr, setShowEditAErr] = React.useState<React.ReactNode>("");

    const updateAVal = () => {
        const req: EditA = {
            textbookKey: questionInfo.textbookKey,
            catalogKey: questionInfo.catalogKey,
            id: questionInfo.id,
            a: aVal,
        }
        httpClient.post("/edit/a", req).then(res => {
            setShowEditAErr("");
            setShowEditA(false);
        }).catch(err => {
            setShowEditAErr(<div>
                <Alert title={`更新A选项出错: ${err.message}`} type={"error"}/>
            </div>);
        })
    }

    const showEditAArea = <div className="mt-2.5">
        <Flex gap="small" wrap justify={"right"}>
            <Button color="cyan" variant="dashed" onClick={updateAVal}>更新</Button>
        </Flex>
    </div>

    return <div className="p-2.5 hover:border border-red-700 border-dashed">
        <div>
            {AddAInfoStyle(aVal, setAVal, setShowEditA)}
        </div>
        {showEditAErr}
        {showEditA && showEditAArea}
    </div>
}
