import { Button, Upload, type UploadProps } from "antd";
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
        <div>提示: 目前仅支持上传markdown文档, 后缀名为.md</div>
      </div>

      <Upload name="uploadQuestion" accept=".md" onChange={handleChange} action={""}>
        <Button icon={<UploadOutlined />}>点击上传</Button>
      </Upload>
    </>
  );
}
