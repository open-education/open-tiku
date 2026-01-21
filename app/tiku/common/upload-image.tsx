import {
  Alert,
  Button,
  Col,
  Flex,
  Image,
  Row,
  Upload,
  type UploadFile,
  type UploadProps,
} from "antd";
import React, { useState } from "react";
import { httpClient } from "~/util/http";
import { PlusOutlined } from "@ant-design/icons";
import type { DeleteImageReq } from "~/type/image";
import type { EditImage } from "~/type/edit";
import { StringUtil } from "~/util/string";

interface UploadImageProps {
  images: UploadFile[];
  setImages: (files: UploadFile[]) => void;
  showTitle: boolean;
  onStartEdit?: (value: boolean) => void;
}

// 图片上传样式
export function AddUploadImageStyle(props: UploadImageProps) {
  const [previewImageOpen, setPreviewImageOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const handleImagePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || "");
    setPreviewImageOpen(true);
  };

  const handleImageChange: UploadProps["onChange"] = (info) => {
    let newFileList = [...info.fileList];

    newFileList = newFileList.map((file) => {
      // 文件上传成功后会在 file 对象上追加 reponse 记录服务端的返回值
      if (file.status == "done") {
        // 本身有的文件不会有 response 字段
        if (
          file.response &&
          file.response.data &&
          file.response.data.length > 0
        ) {
          let res = file.response.data[0];
          file.url = res.url;
          file.name = res.name;
        }
      }

      return file;
    });

    props.setImages(newFileList);
    props.onStartEdit?.(true);
  };

  // 删除图片
  const handleImageDelete: UploadProps["onRemove"] = (info) => {
    if (confirm("确认删除吗?删除后需同步更新对应项")) {
      let reqDel: DeleteImageReq = {
        filename: info.name,
      };

      // 异步删除无法等待前端
      httpClient
        .post<boolean>(`/file/delete`, reqDel)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });

      return true;
    }

    return false;
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <div>
      {props.showTitle && (
        <div>
          <Row gutter={[10, 10]}>
            <Col span={24}>
              <div className="text-blue-700 text-[15px] mb-2.5 font-bold">
                图片
              </div>
            </Col>
          </Row>
        </div>
      )}

      <div style={{ paddingTop: "10px" }}>
        <Upload
          accept=".jpg,.jpeg,.png,.gif"
          action={"/api/file/upload"}
          listType="picture-card"
          fileList={props.images}
          onPreview={handleImagePreview}
          onChange={handleImageChange}
          onRemove={handleImageDelete}
        >
          {props.images.length >= 5 ? null : uploadButton}
        </Upload>
        {previewImage && (
          <Image
            styles={{ root: { display: "none" } }}
            preview={{
              open: previewImageOpen,
              onOpenChange: (visible) => setPreviewImageOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(""),
            }}
            src={previewImage}
          />
        )}
      </div>
    </div>
  );
}

interface EditUploadImageProps {
  images: UploadFile[];
  setImages: (files: UploadFile[]) => void;
  showTitle: boolean;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑图片样式
export function EditUploadImageStyle(props: EditUploadImageProps) {
  const [showEditImage, setShowEditImage] = React.useState(false);
  const [showEditImageErr, setShowEditImageErr] =
    React.useState<React.ReactNode>("");

  const updateImageVal = () => {
    const req: EditImage = {
      id: props.id,
      images: props.images.map((image) => image.name),
    };
    httpClient
      .post<boolean>("/edit/images", req)
      .then((res) => {
        setShowEditImageErr("");
        setShowEditImage(false);
        props.setRefreshListNum(StringUtil.getRandomInt());
      })
      .catch((err) => {
        setShowEditImageErr(
          <div>
            <Alert title={`更新图片出错: ${err.message}`} type={"error"} />
          </div>,
        );
      });
  };

  const showEditImageArea = (
    <div className="mt-2.5">
      <Flex gap="small" wrap justify={"right"}>
        <Button color="cyan" variant="dashed" onClick={updateImageVal}>
          更新
        </Button>
      </Flex>
    </div>
  );

  return (
    <div className="p-2.5 hover:border border-red-700 border-dashed">
      <div>
        {
          <AddUploadImageStyle
            images={props.images}
            setImages={props.setImages}
            showTitle={props.showTitle}
            onStartEdit={setShowEditImage}
          />
        }
      </div>
      {showEditImageErr}
      {showEditImage && showEditImageArea}
    </div>
  );
}
