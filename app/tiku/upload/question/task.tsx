import { Alert, Col, Divider, Empty, Pagination, Row, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import type { TaskListReq, TaskListResp } from "~/type/task";
import { httpClient } from "~/util/http";
import { StringConst } from "~/util/string";

const { Text } = Typography;

// 查看任务列表
export function TaskList(props: any) {
  const questionCateId: number = props.questionCateId ?? 0;

  const [pageNo, setPageNo] = useState<number>(1);
  const [listReqErr, setListReqErr] = useState<React.ReactNode>("");
  const [taskListResp, setTaskListResp] = useState<TaskListResp>({
    list: [],
    total: 0,
    pageNo,
    pageSize: 10,
  });

  let req: TaskListReq = {
    questionCateId,
    taskType: StringConst.taskTypeUploadQuestion,
    pageNo,
    pageSize: 10,
  };

  useEffect(() => {
    httpClient
      .post<TaskListResp>("/task/list", req)
      .then((res) => {
        setListReqErr("");
        setTaskListResp(res);
      })
      .catch((err) => {
        setListReqErr(<Alert title={`任务列表查询失败: ${err.message}`} type="error" />);
      });
  }, [questionCateId, pageNo]);

  const onPageChange = (page: number) => {
    setPageNo(page);
  };

  return (
    <>
      <Space orientation="vertical" size={"small"} style={{ display: "flex" }}>
        <Row gutter={[10, 10]} align="middle" className="text-sm text-blue-700 font-bold">
          <Col span={4}>上传日期</Col>
          <Col span={6}>标题</Col>
          <Col span={2}>作者</Col>
          <Col span={4}>更新日期</Col>
          <Col span={2}>更新状态</Col>
          <Col span={6}>更新结果</Col>
        </Row>

        <Row gutter={[10, 10]} align="middle" className="text-sm text-blue-700 font-bold">
          <Col span={24}>{listReqErr}</Col>
        </Row>
        <Row gutter={[10, 10]} align="middle" className="text-sm text-blue-700 font-bold">
          <Col span={24}>{taskListResp.total == 0 ? <Empty /> : ""}</Col>
        </Row>

        {taskListResp.list?.map((taskInfo) => {
          return (
            <Row gutter={[10, 10]} align="middle" className="hover:bg-blue-100">
              <Col span={4}>{taskInfo.createdAt}</Col>
              <Col span={6}>{taskInfo.name}</Col>
              <Col span={2}>{taskInfo.author}</Col>
              <Col span={4}>{taskInfo.updatedAt}</Col>
              <Col span={2}>
                <Text type="success">{taskInfo.statusDesc}</Text>
              </Col>
              <Col span={6}>{taskInfo.result}</Col>
            </Row>
          );
        })}

        <Row gutter={[10, 10]} align="middle">
          <Col span={24}>
            <Pagination total={taskListResp.total} current={pageNo} defaultPageSize={10} onChange={onPageChange} />
          </Col>
        </Row>
      </Space>
    </>
  );
}
