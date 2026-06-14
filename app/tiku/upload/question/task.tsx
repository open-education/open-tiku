import { Alert, Col, Empty, Pagination, Row, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import type { TaskListReq, TaskListResp } from "~/type/task";
import { httpClient } from "~/util/http";
import { StringConst } from "~/util/string";
import type { BaseType } from "antd/es/typography/Base";

const { Text } = Typography;

// 查看任务列表
export function TaskList(props: any) {
  const questionCateId: number = props.questionCateId ?? 0;
  const refreshTaskListNum: number = props.refreshTaskListNum ?? 0;

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
    // 当分类变化时，如果需要，先重置页码
    if (questionCateId) {
      if (pageNo !== 1) {
        setPageNo(1);
        return; // 等待页码更新后重新触发
      }
    }

    httpClient
      .post<TaskListResp>("/task/list", req)
      .then((res) => {
        setListReqErr("");
        setTaskListResp(res);
      })
      .catch((err) => {
        setListReqErr(<Alert title={`任务列表查询失败: ${err.message}`} type="error" />);
      });
  }, [questionCateId, pageNo, refreshTaskListNum]);

  const onPageChange = (page: number) => {
    setPageNo(page);
  };

  // 状态文字样式
  const getTextTypeDesc = (status: number): BaseType => {
    const statusMap: Record<number, BaseType> = {
      1: "secondary",
      2: "warning",
      3: "success",
    };
    return statusMap[status] || "danger";
  };

  return (
    <>
      <Space orientation="vertical" size={"small"} style={{ display: "flex" }}>
        <Row gutter={[10, 10]} align="middle" className="text-sm text-blue-700 font-bold">
          <Col span={3}>上传日期</Col>
          <Col span={8}>标题</Col>
          <Col span={2}>作者</Col>
          <Col span={3}>更新日期</Col>
          <Col span={2}>更新状态</Col>
          <Col span={6}>更新结果</Col>
        </Row>

        {listReqErr}

        {taskListResp.total == 0 ? <Empty /> : ""}

        {taskListResp.list?.map((taskInfo) => {
          return (
            <Row gutter={[10, 10]} align="middle">
              <Col span={3}>{taskInfo.createdAt}</Col>
              <Col span={8}>{taskInfo.name}</Col>
              <Col span={2}>{taskInfo.author}</Col>
              <Col span={3}>{taskInfo.updatedAt}</Col>
              <Col span={2}>
                <Text type={getTextTypeDesc(taskInfo.status)}>{taskInfo.statusDesc}</Text>
              </Col>
              <Col span={6}>{taskInfo.result}</Col>
            </Row>
          );
        })}

        <Pagination total={taskListResp.total} current={pageNo} defaultPageSize={10} onChange={onPageChange} />
      </Space>
    </>
  );
}
