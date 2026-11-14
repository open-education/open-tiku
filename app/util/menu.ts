import { UserRoleType } from '@/type/enum';
import type { OpsMenu } from '@/type/menu';
import type { UserInfoResp } from '@/type/user';
import { Bot, CircleCheckBig, School, Settings, SquareTerminal, Trophy, UserCog } from 'lucide-react';

// 菜单内容
// 权限配置注意, 会优先直接放行 父路径
export const menuItems: OpsMenu[] = [
  {
    title: '工作台',
    url: '/ops',
    icon: SquareTerminal,
    login: true,
    role: UserRoleType.Normal,
  },
  {
    title: '题目搜索',
    url: '',
    icon: Bot,
    login: false,
    role: UserRoleType.None,
    items: [
      {
        title: '章节/知识点选题',
        url: '/question',
        login: false,
        role: UserRoleType.None,
      },
    ],
  },
  {
    title: '我的贡献',
    url: '',
    icon: Trophy,
    login: true,
    role: UserRoleType.Normal,
    items: [
      {
        title: '我的题目',
        url: '/ops/my/question',
        login: true,
        role: UserRoleType.Normal,
      },
      {
        title: '添加母题',
        url: '/ops/my/question/add',
        login: true,
        role: UserRoleType.Normal,
      },
      {
        title: '上传题目',
        url: '/ops/my/question/upload',
        login: true,
        role: UserRoleType.Normal,
      },
      {
        title: '我的任务',
        url: '/ops/my/question/task',
        login: true,
        role: UserRoleType.Normal,
      },
      {
        title: '我的试卷',
        url: '/ops/my/paper',
        login: true,
        role: UserRoleType.Normal,
      },
    ],
  },
  {
    title: '班级',
    url: '',
    icon: School,
    login: true,
    role: UserRoleType.Teacher,
    items: [{ title: '我的班级', url: '/ops/class', login: true, role: UserRoleType.Teacher }],
  },
  {
    title: '审核',
    url: '',
    icon: CircleCheckBig,
    login: true,
    role: UserRoleType.Teacher,
    items: [
      { title: '题目', url: '/ops/review/question', login: true, role: UserRoleType.Teacher },
      { title: '试卷', url: '/ops/review/paper', login: true, role: UserRoleType.Teacher },
    ],
  },
  {
    title: '系统设置',
    url: '',
    icon: Settings,
    login: true,
    role: UserRoleType.Teacher,
    items: [
      { title: '章节/知识点', url: '/ops/setting/textbook', login: true, role: UserRoleType.Teacher },
      { title: '挂载题型', url: '/ops/setting/ck', login: true, role: UserRoleType.Teacher },
      { title: '通用字典', url: '/ops/setting/dict', login: true, role: UserRoleType.Teacher },
    ],
  },
  {
    title: '用户',
    url: '',
    icon: UserCog,
    login: true,
    role: UserRoleType.Teacher,
    items: [
      { title: '第三方账户列表', url: '/ops/user/account', login: true, role: UserRoleType.Teacher },
      { title: '用户 Session 列表', url: '/ops/user/session', login: true, role: UserRoleType.Teacher },
    ],
  },
];

// key 为终端路由, value 中 title 为 title/subTitle 用户面包屑, login 是否需要登录 role 访问该路由的角色
export const getMenuMap = () => {
  const map: Record<string, { title: string; login: boolean; role: UserRoleType }> = {};

  for (const menu of menuItems) {
    if (menu.items && menu.items.length > 0) {
      for (const sub of menu.items) {
        map[sub.url] = {
          title: `${menu.title} > ${sub.title}`,
          login: sub.login,
          role: sub.role,
        };
      }
    } else {
      map[menu.url] = {
        title: menu.title,
        login: menu.login,
        role: menu.role,
      };
    }
  }

  return map;
};

// 辅助函数：统一判断单个菜单项（父级或子级）是否有权展示
export const checkAccess = (user: UserInfoResp | null, item: { login: boolean; role: UserRoleType } | null): boolean => {
  if (!item) return false;

  // 不需要登录的菜单直接放行
  if (!item.login) return true;

  // 需要登录但当前未登录，拦截
  if (!user) return false;

  // 教师角色拥有所有“非学生”角色的权限
  if (user.role === UserRoleType.Teacher) {
    return item.role !== UserRoleType.Student;
  }

  // 其他角色（Student、Normal 等）精确匹配菜单要求的角色
  return user.role === item.role;
};

// 根据登录用户信息过滤菜单权限
export const filterMenuItems = (user: UserInfoResp | null) => {
  const result: OpsMenu[] = [];

  for (const menu of menuItems) {
    if (menu.items && menu.items.length > 0) {
      const validSubItems = menu.items.filter((sub) => checkAccess(user, sub));

      // 存在有效子菜单时才保留父菜单，浅拷贝避免修改 menuItems 原数据
      if (validSubItems.length > 0) {
        result.push({
          ...menu,
          items: validSubItems,
        });
      }
    } else if (checkAccess(user, menu)) {
      result.push(menu);
    }
  }

  return result;
};
