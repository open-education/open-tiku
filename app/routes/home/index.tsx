import Board from '@/components/home/board';
import Build from '@/components/home/build';
import Feature from '@/components/home/feature';
import Hero from '@/components/home/hero';
import Layered from '@/components/home/layered';
import Mission from '@/components/home/mission';
import Raodmap from '@/components/home/roadmap';
import { useBoardList, useTextbooks } from '@/util/fetcher';
import { TextbookUtil } from '@/util/object';
import { useMemo } from 'react';
import type { Route } from './+types/index';

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

  return (
    <>
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
