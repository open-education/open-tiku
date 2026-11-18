import { CustomPageSource, CustomUserSource } from '@/type/enum';
import React from 'react';
import type { Route } from './+types/index';
import Textbook from '@/components/custom/textbook';

// 定制我的菜单

export function meta({}: Route.MetaArgs) {
  return [
    { title: '默认菜单' },
    {
      name: 'description',
      content: '个性化定制化系统默认菜单, 主要提供给未登录用户使用, 已登录用户推荐使用 我的个性化配置',
    },
  ];
}

export default function Index() {
  return <Textbook userSource={CustomUserSource.System} pageSource={CustomPageSource.Default} />;
}
