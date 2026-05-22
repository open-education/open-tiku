import { Alert, Button, Input, Upload, type UploadProps, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { StringConst, StringValidator } from "~/util/string";
import { httpClient } from "~/util/http";
import type { TaskSaveReq } from "~/type/task";

// 批量上传题目
export function UploadQuestion(props: any) {
  const [messageApi, contextHolder] = message.useMessage();

  const questionCateId: number = props.questionCateId ?? 0;

  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileNotice, setFileNotice] = useState<React.ReactNode>("");
  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status !== "uploading") {
      setFileNotice(<Alert title="文件上传中" type="info" />);
    }
    if (info.file.status === "done") {
      // 本身有的文件不会有 response 字段
      if (info.file.response && info.file.response.data) {
        setFileNotice("");
        let res = info.file.response.data;
        setFileUrl(res.name); // 实际上 url 是前端访问的地址, name 是文件在磁盘上的名字, 路径需要根据业务去确定
        setFileName(res.originalName); // 原始文件名, 给前端展示
      }
    } else if (info.file.status === "error") {
      setFileNotice(<Alert title="文件上传失败" type="error" />);
    } else {
      console.log("info");
    }
  };

  const [email, setEmail] = useState<string>("");
  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmail(e.target.value);
  };

  const [saveErr, setSaveErr] = useState<React.ReactNode>("");

  const saveFile = () => {
    if (questionCateId === 0 || questionCateId < 0) {
      setSaveErr(<Alert title="题型为空" type={"error"} />);
      return;
    }
    if (!StringValidator.isNonEmpty(fileUrl)) {
      setSaveErr(<Alert title="文件为空" type={"error"} />);
      return;
    }
    if (!StringValidator.isNonEmpty(fileName)) {
      setSaveErr(<Alert title="文件名称为空" type={"error"} />);
      return;
    }

    let req: TaskSaveReq = {
      questionCateId,
      taskType: StringConst.taskTypeUploadQuestion,
      name: fileName,
      url: fileUrl,
      email: email,
    };

    httpClient
      .post<number>("/task/add", req)
      .then((taskId) => {
        // 成功后调整
        if (saveErr) {
          setSaveErr("");
        }

        // 清空表单内容避免重复添加
        setFileName("");
        setFileUrl("");
        setEmail("");

        // 是否加载任务列表
        messageApi.open({
          type: "success",
          content: "任务添加成功",
        });
      })
      .catch((err) => {
        setSaveErr(<Alert title={`任务创建失败: ${err.message}`} type={"error"} />);
      });
  };

  return (
    <>
      {contextHolder}

      <div className="text-sm text-blue-700 mb-2.5">
        <div>提示: </div>
        <div>1. 目前仅支持上传 markdown 文档, 后缀名为 .md;</div>
        <div>2. markdown 文件格式见下面模板规范, 如果有差异或者需要调整, 则需要更新解析逻辑后才可正确导入题目;</div>
        <div>3. 题目上传后不会立即处理, 系统会根据资源使用情况定时处理, 处理完成后会将处理结果发送至你的邮件中(如果填写);</div>
      </div>

      <div className="mt-2.5">
        <a
          href={"/api/file/read/file/7434728800.md"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-dashed border-gray-300 rounded-md hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 ease-in-out"
        >
          查看模板
        </a>
      </div>

      <div className="mt-2.5">
        <Upload name="uploadQuestion" accept=".md" onChange={handleChange} action={"/api/file/upload/file"}>
          <Button icon={<UploadOutlined />}>点击上传</Button>
        </Upload>
      </div>

      <div className="mt-2.5">{fileNotice}</div>

      <div className="mt-2.5">
        <Input placeholder="请输入接收任务结果通知的邮箱地址" value={email} onChange={onEmailChange} />
      </div>

      <div className="mt-2.5">
        <Button type="primary" onClick={saveFile}>
          保存
        </Button>
      </div>

      <div className="mt-2.5">{saveErr}</div>
    </>
  );
}
