import {
  Col,
  Flex,
  type GetProp,
  Image,
  Radio,
  type RadioChangeEvent,
  Row,
  Upload,
  type UploadFile,
  type UploadProps
} from "antd";
import React, {type Dispatch, type SetStateAction, useState} from "react";
import {httpClient} from "~/util/http";
import {PlusOutlined} from "@ant-design/icons";
import type {DeleteImageReq} from "~/type/image";
import {StringUtil} from "~/util/string";

export function UploadImageStyle(
  questionCateId: number,
  imageFileList: UploadFile[],
  setImageFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>,
  id?: number,
  setRefreshListNum?: Dispatch<SetStateAction<number>>,
) {
  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // 题目图片
  let reqUploadUrl = `/api/file/upload?textbookKey=&catalogKey=${questionCateId}`;
  if (id && id > 0) {
    reqUploadUrl += `&id=${id}`;
  }

  const [previewImageOpen, setPreviewImageOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handleImagePreview = async (file: UploadFile) => {
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
    if (confirm("确认删除吗?")) {
      let reqDel: DeleteImageReq = {
        textbookKey: "",
        catalogKey: "",
        filename: info.name,
      }
      if (id && id > 0) {
        reqDel.id = id.toString();
      }

      httpClient.post<boolean>(`/file/delete`, reqDel).then(res => {
        if (id && id > 0 && setRefreshListNum) {
          setRefreshListNum(StringUtil.getRandomInt());
        }
        return true;
      }).catch(err => {
        return false;
      })
    }
    return false;
  };

  const uploadButton = (
    <button style={{border: 0, background: "none"}} type="button">
      <PlusOutlined/>
      <div style={{marginTop: 8}}>Upload</div>
    </button>
  );

  return <div>
    <div className="p-2.5">
      <Row gutter={[10, 10]}>
        <Col span={24}>
          <div className="text-blue-700 text-[15px] mb-2.5 font-bold">图片</div>
        </Col>
      </Row>
    </div>

    <div style={{padding: "10px"}}>
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
    </div>
  </div>
}
