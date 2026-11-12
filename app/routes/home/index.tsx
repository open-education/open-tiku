import { SimpleAlert } from '@/common/alert';
import { Loading } from '@/common/load';
import Board from '@/components/home/board';
import Build from '@/components/home/build';
import Feature from '@/components/home/feature';
import Hero from '@/components/home/hero';
import Layered from '@/components/home/layered';
import Mission from '@/components/home/mission';
import Raodmap from '@/components/home/roadmap';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import { useBoardList, useTextbooks } from '@/util/fetcher';
import { TextbookUtil } from '@/util/object';
import { useMemo } from 'react';

// 默认首页
export default function Index() {
  // 网站主要导航
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap = useMemo(() => {
    return TextbookUtil.createTextbookPathDict(textbooks);
  }, [textbooks]);

  // 统计面板数据
  const {
    data: boardResp = {
      countInfo: { textbookNum: 0, questionNum: 0, paperNum: 0, teacherNum: 0, studentNum: 0 },
      latestQuestions: [],
      topTeacherQuestions: [],
      topTextbooks: [],
    },
    isLoading: boardRespLoading,
    error: boardRespErr,
  } = useBoardList();

  const showLoading = useDelayedLoading(textbooksIsLoading || boardRespLoading);

  return (
    <>
      {showLoading && <Loading />}
      {textbooksErr && <SimpleAlert title="教材和考点查询出错" message={textbooksErr.message} />}
      {boardRespErr && <SimpleAlert title="统计信息查询出错" message={boardRespErr.message} />}
      <Hero countInfo={boardResp.countInfo} />
      <Feature />
      <Layered />
      <Board pathMap={pathMap} boardResp={boardResp} />
      <Mission />
      <Raodmap />
      <Build />
    </>
  );
}
