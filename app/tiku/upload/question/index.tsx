import { Button, Input, Upload, type UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";

// 批量上传题目
export function UploadQuestion(props: any) {
  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      console.log("success");
    } else if (info.file.status === "error") {
      console.log("failed");
    } else {
      console.log("info");
    }
  };

  return (
    <>
      <div className="text-sm text-blue-700 mb-2.5">
        <div>提示: </div>
        <div>1. 目前仅支持上传 markdown 文档, 后缀名为 .md;</div>
        <div>2. markdown 文件格式见下面模板规范, 如果有差异或者需要调整, 则需要更新解析逻辑后才可正确导入题目;</div>
        <div>3. 题目上传后不会立即处理, 系统会根据资源使用情况定时处理, 处理完成后会将处理结果发送至你的邮件中;</div>
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

      <div className="mt-2.5">
        <Input placeholder="请输入接收任务结果通知的邮箱地址" value={""} />
      </div>

      <div className="mt-2.5">
        <Button type="primary">保存</Button>
      </div>
    </>
  );
}
