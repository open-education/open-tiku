import TextbookList from '@/components/custom/textbook';
import { CustomPageSource, CustomUserSource } from '@/type/enum';
import type { Route } from './+types/index';

// 定制我的菜单

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的个性化默认菜单' },
    {
      name: 'description',
      content: '个性化定制化我的默认菜单',
    },
  ];
}

export default function Index() {
  return <TextbookList key="my-custom" userSource={CustomUserSource.Person} pageSource={CustomPageSource.My} />;
}
