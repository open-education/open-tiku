# 开放题库

前端项目代码库.

## 项目

项目使用的是 [React Router](https://reactrouter.com/) 框架.

前端 UI 组件库使用的是 [Ant Design](https://ant.design/index-cn/).

### 安装

安装依赖和配置后端 nginx 代理

##### 1. 安装依赖

现在前端基本都需要运行在 [Node.js](https://nodejs.org/en/download/) 之上，如果没有 Node 环境的先安装 Node 环境

```bash
npm install
```

或者

```bash
npm i
```

##### 2. 配置 nginx 代理

比如一个最简单的 nginx 代理配置，根据自己电脑酌情处理，任何代理服务均可，目的是为了解决开发阶段前端访问后端服务跨域问题

```
server {
    # 监听端口
    listen 9010;
    server_name localhost;
    
    # 字符集
    charset utf-8;

    # 前端静态文件服务 (React/Vue)
    location / {
        # 代理到前端开发服务器
        proxy_pass http://localhost:5173;
    }

    # API 代理到后端服务
    location /api/ {
        # 代理到后端服务器
	    proxy_pass http://localhost:8080/;
    }

    # 错误页面
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

##### 3 后端接口配置

目前后端接口配置在 .env.development 文件中，形如:

```
VITE_API_BASE_URL=http://192.168.19.191:9010/api
```

线上配置是

```
VITE_API_BASE_URL=/api
```

具体配置可以查看请求的路径来修正

这里的 /api 对应 nginx 中的转发路由前缀

### 开发环境

使用 [Express.js](https://expressjs.com/) 来运行服务, 详情查看 [server.js](server.js) 文件内容, 内部区分了开发和生产环境.

```bash
npm run dev
```

#### 打包

部署需要先使用 [build.sh](build.sh) 脚本来打包, 打包后的目标文件 存储在 target 目录中, 打包完毕后将该压缩包上传至代码仓库 Releases 处管理即可

其中 package.json server.js 两个文件一起进行了打包, deploy.sh 第一次需要手动上传至服务器, 后续有变更需要重新上传

#### 部署

目前需要手动登陆至服务器进行部署, 部署脚本见 [deploy.sh](deploy.sh) 内容说明

```
sh build.sh
```

因为 node 环境变量的原因, 部署时需要提供一个环境变量, 比如当前目录下 .env 文件，内容类似如下

```
#!/bin/sh

export NODE_ENV=production
export PORT=8082
```

部署命令如:

```
source .env && sh deploy.sh start -v v0.0.1-beta
```

其中可以指定端口, 通常默认配置的端口号已经进行了 nginx 配置, 如果变更需要调整 nginx 配置内容. 

不指定版本号时认为已经存在目标文件, 否则会从 github 重新下载该版本文件来执行新的部署
