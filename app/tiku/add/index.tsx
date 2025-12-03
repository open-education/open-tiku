// 题目添加主页
import React, {useCallback, useState} from "react";
import {
    Alert,
    Button,
    Checkbox,
    Col,
    Flex,
    type GetProp,
    Image,
    Input,
    Radio,
    type RadioChangeEvent,
    Rate,
    Row,
    Splitter,
    Upload,
    type UploadFile,
    type UploadProps,
    Watermark
} from "antd";
import {PlusOutlined} from "@ant-design/icons";

import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import Preview from "../preview";

import type {QuestionInfo, QuestionUploadResp} from "~/type/question";
import {CommonBreadcrumb} from "~/tiku/common/breadcrumb";
import type {TiKuIndexContext} from "~/type/context";
import {useOutletContext} from "react-router-dom";
import {httpClient} from "~/util/http";
import Info from "~/tiku/info";
import {StringUtil} from "~/util/string";

const {Search, TextArea} = Input;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

export default function Add(props: any) {
    const {
        textbookKey,
        catalogKey,
        subjectList,
        catalogList,
        questionTypeList,
        tagList
    } = useOutletContext<TiKuIndexContext>();

    //// 题目类型
    const questionType = questionTypeList[0];
    const [questionTypeVal, setQuestionTypeVal] = useState(questionType.key);
    const onQuestionsChange = ({target: {value}}: RadioChangeEvent) => {
        setQuestionTypeVal(value);
    };

    //// 标签
    const tag = tagList[0];
    const [tagVal, setTagVal] = useState([tag.key]);
    // @ts-ignore
    const onTagsChange: GetProp<typeof Checkbox.Group, "onChange"> = (
        checkedValues: string[]
    ) => {
        setTagVal(checkedValues);
    };

    //// 评分
    const [rateVal, setRateVal] = useState(0);
    const onRateChange = (val: number) => {
        setRateVal(val);
    };

    //// 变式题 -- todo
    const [bianShiValue, setBianShiValue] = useState(1);

    const onBianShiChange = (e: RadioChangeEvent) => {
        setBianShiValue(e.target.value);
    };

    //// 标题
    const [titleVal, setTitleVal] = useState("");
    const onTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setTitleVal(e.target.value);
        },
        []
    );

    //// 补充
    const [mentionVal, setMentionVal] = useState("");
    const onMentionChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setMentionVal(e.target.value);
        },
        []
    );

    //// 题目图片
    const reqUploadUrl = `/api/file/upload?textbook_key=${textbookKey}&catalog_key=${catalogKey}`;
    const [previewImageOpen, setPreviewImageOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

    const handleImagePreview = async (file: UploadFile) => {
        console.log("触发预览", file);
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewImageOpen(true);
    };

    const handleImageChange: UploadProps["onChange"] = (info) => {
        let newFileList = [...info.fileList];

        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        newFileList = newFileList.slice(-2);

        // 2. Read from response and show file link
        newFileList = newFileList.map((file) => {
            // 文件上传成功后会在 file 对象上追加 reponse 记录服务端的返回值
            if (file.status == "done") {
                let res = file.response.data[0];
                file.url = res.url;
                file.name = res.name;
            }
            return file;
        });

        setImageFileList(newFileList);
    };

    const handleImageDelete: UploadProps["onRemove"] = (info) => {
        httpClient.delete<boolean>(`/file/delete/${textbookKey}/${catalogKey}/${info.name}`).then(res => {
        }).catch(err => {
        })
    };

    const uploadButton = (
        <button style={{border: 0, background: "none"}} type="button">
            <PlusOutlined/>
            <div style={{marginTop: 8}}>Upload</div>
        </button>
    );
    const [showImageVal, setShowImageVal] = useState("0");
    const onShowImageChange = (e: RadioChangeEvent) => {
        setShowImageVal(e.target.value);
    };

    //// 选项
    const [aVal, setAVal] = useState("");
    const onASelectChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setAVal(e.target.value);
        },
        []
    );
    const [bVal, setBVal] = useState("");
    const onBSelectChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setBVal(e.target.value);
        },
        []
    );
    const [cVal, setCVal] = useState("");
    const onCSelectChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setCVal(e.target.value);
        },
        []
    );
    const [dVal, setDVal] = useState("");
    const onDSelectChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setDVal(e.target.value);
        },
        []
    );
    const [eVal, setEVal] = useState("");
    const onESelectChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setEVal(e.target.value);
        },
        []
    );
    const [showSelectVal, setShowSelectVal] = useState("1");
    const onShowSelectChange = (e: RadioChangeEvent) => {
        setShowSelectVal(e.target.value);
    };

    //// 答案
    const [answerVal, setAnswerVal] = useState("");
    const onAnswerChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setAnswerVal(e.target.value);
        },
        []
    );

    //// 知识点
    const [knowledgeVal, setKnowledgeVal] = useState("");
    const onKnowledgeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setKnowledgeVal(e.target.value);
        },
        []
    );

    //// 解题分析
    const [analyzeVal, setAnalyzeVal] = useState("");
    const onAnalyzeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setAnalyzeVal(e.target.value);
        },
        []
    );

    //// 解题过程
    const [processVal, setProcessVal] = useState("");
    const onProcessChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setProcessVal(e.target.value);
        },
        []
    );

    //// 解题备注
    const [remarkVal, setRemarkVal] = useState("");
    const onRemarkChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setRemarkVal(e.target.value);
        },
        []
    );

    //// 预览逻辑
    // 生成预览对象
    const [openPreviewArea, setOpenPreviewArea] = useState(false);
    let [questionInfo, setQuestionInfo] = useState({});

    // 点击生成题目样式预览
    const onToPreview = () => {
        const imageFileNames: string[] = [];
        imageFileList.forEach((image) => {
            imageFileNames.push(image.name);
        });
        // image_names: imageFileNames, // 图片名字列表

        let previewQuestionInfo: QuestionInfo = {
            id: "",
            textbookKey: textbookKey,
            catalogKey: catalogKey,
            questionType: questionTypeVal,
            tags: tagVal,
            rateVal: rateVal.toString(),
            titleVal: titleVal,
            mentionVal: mentionVal,
            imageNames: imageFileNames,
            showImageVal: showImageVal,
            aVal: aVal,
            bVal: bVal,
            cVal: cVal,
            dVal: dVal,
            eVal: eVal,
            showSelectVal: showSelectVal,
            answerVal: answerVal,
            knowledgeVal: knowledgeVal,
            analyzeVal: analyzeVal,
            processVal: processVal,
            remarkVal: remarkVal,
        }
        setOpenPreviewArea(true);
        setQuestionInfo(previewQuestionInfo);
    };

    // Notice
    const [uploadQuestionIng, setUploadQuestionIng] = useState<React.ReactNode>("");
    const [uploadQuestionErr, setUploadQuestionErr] = useState<React.ReactNode>("");
    const [reqQuestionInfoErr, setReqQuestionInfoErr] = useState<React.ReactNode>("");

    // 保存
    const onToUploadQuestion = () => {
        if (confirm("确定要上传题目吗？")) {
            setUploadQuestionIng(<Alert title="题目上传中..." type="info"/>);

            const imageFileNames: string[] = [];
            imageFileList.forEach((image) => {
                imageFileNames.push(image.name);
            });

            const uploadReq = {
                textbookKey,
                catalogKey,
                questionType: questionTypeVal,
                tags: tagVal,
                rateVal: rateVal.toString(),
                titleVal,
                imageNames: imageFileNames,
                mentionVal,
                showImageVal,
                aVal: aVal,
                bVal: bVal,
                cVal: cVal,
                dVal: dVal,
                eVal: eVal,
                showSelectVal,
                answerVal,
                knowledgeVal,
                analyzeVal,
                processVal,
                remarkVal,
            }

            httpClient.post<QuestionUploadResp>("/question/upload", uploadReq).then(uploadRes => {
                setUploadQuestionIng("");

                // 获取题目全部信息
                httpClient.post<QuestionInfo>(`/question/info`, {
                    "id": uploadRes.id,
                    "textbookKey": textbookKey,
                    "catalogKey": catalogKey,
                }).then(readRes => {
                    props.setDrawerTitle("详情");
                    props.setDrawerContent(<Info questionInfo={readRes}/>);

                    props.setRefreshListNum(StringUtil.getRandomInt());
                }).catch(err => {
                    setReqQuestionInfoErr(<Alert
                        title="Error"
                        description={`读取题目详情出错: ${err.message}`}
                        type="error"
                        showIcon
                    />)
                })
            }).catch(err => {
                setUploadQuestionErr(<Alert
                    title="Error"
                    description={`上传题目出错: ${err.message}`}
                    type="error"
                    showIcon
                />);
            });
        }
    };

    return <div>
        <Row>
            <Col span={24}>
                {/* 面包屑快速导航 */}
                {CommonBreadcrumb(subjectList, catalogList, textbookKey, catalogKey)}
            </Col>
        </Row>

        <Row gutter={[20, 20]}>
            <Col span={24}>
                {uploadQuestionIng}
                {uploadQuestionErr}
                {reqQuestionInfoErr}
            </Col>
        </Row>

        <Row style={{marginTop: "20px"}}>
            <Col>
                <Flex gap="small" wrap>
                    <Button type="dashed" onClick={onToPreview}>
                        预览
                    </Button>
                    <Button type="primary" onClick={onToUploadQuestion}>
                        保存
                    </Button>
                </Flex>
            </Col>
        </Row>

        <Splitter
            style={{boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", marginTop: "10px"}}
        >
            <Splitter.Panel defaultSize={"50%"}>
                <Row>
                    {/* 题型 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "15px",
                                marginBottom: "10px",
                            }}
                        >
                            题型
                        </div>
                        <Flex vertical gap="middle">
                            <Radio.Group
                                defaultValue={questionTypeVal}
                                buttonStyle="solid"
                                onChange={onQuestionsChange}
                            >
                                {questionTypeList.map(item => {
                                    return (
                                        <Radio.Button key={item.key} value={item.key}>
                                            {item.label}
                                        </Radio.Button>
                                    );
                                })}
                            </Radio.Group>
                        </Flex>
                    </Col>

                    {/* 标签 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "15px",
                                marginBottom: "10px",
                            }}
                        >
                            标签
                        </div>
                        <Checkbox.Group
                            defaultValue={tagVal}
                            style={{width: "100%"}}
                            onChange={onTagsChange}
                        >
                            <Row>
                                {tagList.map(item => {
                                    return (
                                        <Col span={6} key={item.key}>
                                            <Checkbox value={item.key}>{item.label}</Checkbox>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Checkbox.Group>
                    </Col>

                    {/* 难易程度 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "15px",
                                marginBottom: "10px",
                            }}
                        >
                            难易程度
                        </div>
                        <Rate allowHalf defaultValue={rateVal} onChange={onRateChange}/>
                    </Col>

                    {/* 变式题 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "15px",
                                marginBottom: "10px",
                            }}
                        >
                            变式题
                        </div>
                        <Search
                            placeholder="请输入要关联父题题目的关键字"
                            style={{width: 300}}
                        />
                        <Radio.Group
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                            onChange={onBianShiChange}
                            value={bianShiValue}
                            options={[
                                {
                                    value: 1,
                                    label: (
                                        <Markdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {`已知向量$\\overrightarrow{a}$,$\\overrightarrow{b}$满足$|\\overrightarrow{a}|=1$,$|\\overrightarrow{a}+2\\overrightarrow{b}|=2$,且$(\\overrightarrow{b}-2\\overrightarrow{a})\\perp\\overrightarrow{b}$,则$|\\overrightarrow{b}|$=`}
                                        </Markdown>
                                    ),
                                },
                                {
                                    value: 2,
                                    label: (
                                        <Markdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                        >
                                            {`记$\\triangle ABC$的内角$A$、$B$、$C$的对边分别为$a$、$b$、$c$，已知$sin A+\\sqrt{3}cos A=2$
                  (1)求$A$；
                  (2)若$a=2$，$\\sqrt{2}bsin C=csin 2B$，求$\\triangle ABC$的周长。`}
                                        </Markdown>
                                    ),
                                },
                                {value: 3, label: "下列各组数据是勾股数的是（       ）"},
                                {
                                    value: 4,
                                    label:
                                        "在如图所示的平面直角坐标系中，小手盖住的点的坐标可能是（     ）",
                                },
                            ]}
                        />
                    </Col>

                    {/* 标题 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "15px",
                                marginBottom: "10px",
                            }}
                        >
                            标题
                        </div>
                        <TextArea
                            autoSize={{minRows: 2, maxRows: 5}}
                            placeholder="请输入题目标题"
                            onChange={onTitleChange}
                            name="title"
                            value={titleVal}
                        />
                    </Col>

                    {/* 补充 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "12px",
                                marginBottom: "10px",
                            }}
                        >
                            补充
                        </div>
                        <TextArea
                            autoSize={{minRows: 2, maxRows: 5}}
                            placeholder="请输入题目补充"
                            onChange={onMentionChange}
                            name="mention"
                            value={mentionVal}
                        />
                    </Col>

                    {/* 题目配图 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    color: "blue",
                                    fontSize: "14px",
                                    display: "inline-block",
                                }}
                            >
                                图片
                            </div>
                            <div
                                style={{
                                    display: "inline-block",
                                    float: "right",
                                }}
                            >
                                <Flex vertical gap="middle">
                                    <Radio.Group
                                        defaultValue={showImageVal}
                                        buttonStyle="solid"
                                        onChange={onShowImageChange}
                                        block
                                        options={[
                                            {
                                                value: "0",
                                                label: "题目下边",
                                            },
                                            {
                                                value: "1",
                                                label: "题目右边",
                                            },
                                        ]}
                                        optionType="button"
                                    />
                                </Flex>
                            </div>
                        </div>

                        <div style={{paddingTop: "10px"}}>
                            <Row>
                                <Upload
                                    accept=".jpg,.jpeg,.png,.gif"
                                    action={reqUploadUrl}
                                    listType="picture-card"
                                    fileList={imageFileList}
                                    onPreview={handleImagePreview}
                                    onChange={handleImageChange}
                                    onRemove={handleImageDelete}
                                >
                                    {imageFileList.length >= 5 ? null : uploadButton}
                                </Upload>
                                {previewImage && (
                                    <Image
                                        styles={{root: {display: "none"}}}
                                        preview={{
                                            open: previewImageOpen,
                                            onOpenChange: (visible) => setPreviewImageOpen(visible),
                                            afterOpenChange: (visible) =>
                                                !visible && setPreviewImage(""),
                                        }}
                                        src={previewImage}
                                    />
                                )}
                            </Row>
                        </div>
                    </Col>

                    {/* 选项 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    color: "blue",
                                    fontSize: "14px",
                                    display: "inline-block",
                                }}
                            >
                                选项
                            </div>
                            <div
                                style={{
                                    display: "inline-block",
                                    float: "right",
                                    width: "16%",
                                    fontSize: "12px",
                                    lineHeight: "24px",
                                    textAlign: "center",
                                }}
                            >
                                选项布局
                            </div>
                        </div>

                        <div style={{paddingTop: "10px"}}>
                            <Row>
                                <Col span={20}>
                                    <Row>
                                        <Col
                                            span={24}
                                            style={{
                                                padding: "10px",
                                            }}
                                        >
                                            <div style={{color: "blue", fontSize: "15px"}}>A</div>
                                            <TextArea
                                                autoSize={{minRows: 2, maxRows: 5}}
                                                placeholder="A选项内容"
                                                onChange={onASelectChange}
                                                name="A"
                                                value={aVal}
                                            />
                                        </Col>
                                        <Col
                                            span={24}
                                            style={{
                                                padding: "10px",
                                            }}
                                        >
                                            <div style={{color: "blue", fontSize: "15px"}}>B</div>
                                            <TextArea
                                                autoSize={{minRows: 2, maxRows: 5}}
                                                placeholder="B选项内容"
                                                onChange={onBSelectChange}
                                                name="B"
                                                value={bVal}
                                            />
                                        </Col>
                                        <Col
                                            span={24}
                                            style={{
                                                padding: "10px",
                                            }}
                                        >
                                            <div style={{color: "blue", fontSize: "15px"}}>C</div>
                                            <TextArea
                                                autoSize={{minRows: 2, maxRows: 5}}
                                                placeholder="C选项内容"
                                                onChange={onCSelectChange}
                                                name="C"
                                                value={cVal}
                                            />
                                        </Col>
                                        <Col
                                            span={24}
                                            style={{
                                                padding: "10px",
                                            }}
                                        >
                                            <div style={{color: "blue", fontSize: "15px"}}>D</div>
                                            <TextArea
                                                autoSize={{minRows: 2, maxRows: 5}}
                                                placeholder="D选项内容"
                                                onChange={onDSelectChange}
                                                name="D"
                                                value={dVal}
                                            />
                                        </Col>
                                        <Col
                                            span={24}
                                            style={{
                                                padding: "10px",
                                            }}
                                        >
                                            <div style={{color: "blue", fontSize: "15px"}}>E</div>
                                            <TextArea
                                                autoSize={{minRows: 2, maxRows: 5}}
                                                placeholder="E选项内容"
                                                onChange={onESelectChange}
                                                name="E"
                                                value={eVal}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={4}>
                                    <Flex vertical gap="middle">
                                        <Radio.Group
                                            defaultValue={showSelectVal}
                                            buttonStyle="solid"
                                            onChange={onShowSelectChange}
                                            vertical
                                            block
                                            options={[
                                                {
                                                    value: "1",
                                                    label: "展示一行",
                                                },
                                                {
                                                    value: "2",
                                                    label: "展示一列",
                                                },
                                                {
                                                    value: "3",
                                                    label: "展示两列",
                                                },
                                            ]}
                                            optionType="button"
                                        />
                                    </Flex>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    {/* 参考答案 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "14px",
                                marginBottom: "10px",
                            }}
                        >
                            参考答案
                        </div>
                        <TextArea
                            autoSize={{minRows: 2, maxRows: 5}}
                            placeholder="参考答案"
                            onChange={onAnswerChange}
                            name="answer"
                            value={answerVal}
                        />
                    </Col>

                    {/* 知识点 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "14px",
                                marginBottom: "10px",
                            }}
                        >
                            知识点
                        </div>
                        <TextArea
                            autoSize={{minRows: 2, maxRows: 5}}
                            placeholder="知识点"
                            onChange={onKnowledgeChange}
                            name="knowledge"
                            value={knowledgeVal}
                        />
                    </Col>

                    {/* 解题分析 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "14px",
                                marginBottom: "10px",
                            }}
                        >
                            解题分析
                        </div>
                        <TextArea
                            autoSize={{minRows: 2, maxRows: 5}}
                            placeholder="解题分析"
                            onChange={onAnalyzeChange}
                            name="analyze"
                            value={analyzeVal}
                        />
                    </Col>

                    {/* 解题过程 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "14px",
                                marginBottom: "10px",
                            }}
                        >
                            解题过程
                        </div>
                        <TextArea
                            autoSize={{minRows: 2, maxRows: 5}}
                            placeholder="解题过程"
                            onChange={onProcessChange}
                            name="process"
                            value={processVal}
                        />
                    </Col>

                    {/* 备注 */}
                    <Col
                        span={24}
                        style={{
                            border: "1px dotted blue",
                            padding: "10px",
                        }}
                    >
                        <div
                            style={{
                                color: "blue",
                                fontSize: "14px",
                                marginBottom: "10px",
                            }}
                        >
                            备注
                        </div>
                        <TextArea
                            autoSize={{minRows: 2, maxRows: 5}}
                            placeholder="备注"
                            onChange={onRemarkChange}
                            name="remark"
                            value={remarkVal}
                        />
                    </Col>
                </Row>
            </Splitter.Panel>

            <Splitter.Panel defaultSize="50%">
                <Watermark content="预览区域 仅展示效果">
                    <div className="min-h-[1900px] p-5">
                        {openPreviewArea ?
                            <Preview questionInfo={questionInfo}/> : ""}
                    </div>
                </Watermark>
            </Splitter.Panel>
        </Splitter>
    </div>
}
