import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Login } from '@/components/user/login';
import { getUserInfo, handleLogout } from '@/util/user';
import { LogOutIcon, UserKey } from 'lucide-react';

// 登录组件目前只支持跳转回首页

// 用户登录信息
interface AuthProps {
  setSheetOpen?: (val: boolean) => void; // 首页管理侧边栏菜单
}
export default function Auth({ setSheetOpen }: AuthProps) {
  // 获取用户信息
  const { isLogin, username } = getUserInfo();

  if (isLogin) {
    return (
      <>
        {/* PC端：显示用户名下拉菜单 */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="max-w-75 truncate">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-xs leading-none">{username.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-blue-700 text-base">{username}</span> <span>已登录</span>
                  </div>
                </Button>
              }
            />
            <DropdownMenuContent>
              <DropdownMenuItem variant="destructive" onClick={handleLogout} className="text-sm">
                <LogOutIcon />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 移动端：显示头像按钮，点击打开Sheet */}
        <Button variant="ghost" size="icon" className="md:hidden rounded-full w-8 h-8 p-0" onClick={() => setSheetOpen?.(true)}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            {username.charAt(0).toUpperCase()}
          </div>
        </Button>
      </>
    );
  }

  return (
    <div>
      {/* 未登录显示登录按钮 - 所有屏幕均显示，但移动端可能更紧凑 */}
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="ghost" className="text-sm">
              <UserKey />
              账户登录
            </Button>
          }
        ></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">账号登录</DialogTitle>
            <DialogDescription>不支持注册, 也不收集除昵称外的任何信息, 用户也不要提供任何真实信息</DialogDescription>
          </DialogHeader>

          <Login />

          <Separator />

          <DialogFooter>
            <DialogClose render={<Button variant="outline">关闭</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
