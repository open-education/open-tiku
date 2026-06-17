# 开放题库

前端项目代码库.

## 项目

项目使用的是 [React Router](https://reactrouter.com/) 框架.

前端 UI 组件库使用的是 [Ant Design](https://ant.design/index-cn/)(新功能不再使用, 后续会被替换为 `shadcn/ui`) 和 [shadcn/ui](https://ui.shadcn.com/).

### 安装

安装依赖和配置后端 caddy 代理

##### 1. 安装依赖

现在前端基本都需要运行在 [Node.js](https://nodejs.org/en/download/) 之上，如果没有 Node 环境的先安装 Node 环境

```bash
npm install
```

或者

```bash
npm i
```

##### 2. 配置 caddy 代理

开发环境 Caddyfile 配置, 安装自己系统的规范添加如下内容即可，本地不需要 https 域名证书指定 80 端口访问或者自行适配即可

```bash
[zhangguangxun@b760m open-tiku-api]$ cat /etc/caddy/conf.d/tiku
tiku.test:80 {
    encode zstd gzip

    handle_path /api/* {
        reverse_proxy 127.0.0.1:8082
    }

    handle {
        reverse_proxy 127.0.0.1:5173
    }
}

admin-tiku.test:80 {
    encode zstd gzip

    handle_path /api/* {
        reverse_proxy 127.0.0.1:8082
    }

    handle {
        reverse_proxy 127.0.0.1:5174
    }
}
```

本地域名解析

```bash
[zhangguangxun@b760m open-tiku-api]$ cat /etc/hosts
# Static table lookup for hostnames.
# See hosts(5) for details.
127.0.0.1        localhost
::1              localhost

# add tiku domain
127.0.0.1 tiku.test
127.0.0.1 admin-tiku.test
[zhangguangxun@b760m open-tiku-api]$
```

##### 3 后端接口配置

目前后端接口配置在 .env.development 文件中，形如:

```
VITE_API_BASE_URL=http://tiku.test/api
```

线上配置是

```
VITE_API_BASE_URL=/api
```

具体配置可以查看请求的路径来修正

### 开发环境

环境相关的配置可以看 open-tiku-backend 的说明更详细一些

```bash
npm run dev
```

#### 格式化

[VS Code](https://code.visualstudio.com/), 其它 IDE 注意不要引起代码大的格式化变动即可

[Prettier](https://prettier.io/) 代码格式化插件

Editor: Format On Save 格式化时机, 保存时格式化即可

Workbench › Tree: Indent 目录缩进默认8太窄, 加宽更容易区分

Prettier: Print Width 用户空间设置 150 个字符宽度, 现在显示器都比较宽 默认的 80 个字符宽度代码反而到处折行

#### 打包

部署需要先使用 [build.sh](build.sh) 脚本来打包, 打包后的目标文件 存储在 target 目录中, 打包完毕后将该压缩包上传至代码仓库 Releases 处管理即可

```
sh build.sh
```

#### 部署

目前需要手动登陆至服务器进行部署, 部署脚本见 [deploy.sh](deploy.sh) 内容说明

deploy.sh 第一次需要手动上传至服务器, 后续有变更需要重新上传

部署命令如:

```
sh deploy.sh -v v0.0.1-beta
```
