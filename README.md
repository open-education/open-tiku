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

现在因为有两个前端服务, 部署在一台机器上, 因此需要配置两个前端访问路径. 如果你未做同样的配置, 需要将以下要注意的4点也做对应的更改, 更改后要注意部署机器上的配置, 否则不要盲目将该更改提交到主分支

```
server {
    listen 80;
    server_name localhost;
    charset utf-8;

    # 1. 前端项目代理
    location /frontend/ {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 2. 后端项目代理
    location /backend/ {
        proxy_pass http://127.0.0.1:5174;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 3. API 接口
    location /api/ {
        proxy_pass http://127.0.0.1:8082/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
注意以下5点, 如果自己的配置不一样请对应调整

#### 1. `proxy_pass http://127.0.0.1:5174;`

这个配置后面没有 `/`, 转发后要保留 `/backend` 一样的路径, 不然浏览器区分不了资源, ip和端口使用自己电脑的即可

#### 2. [vite.config.ts](vite.config.ts) 文件中的这个属性要配置跟 nginx 对应

```
export default defineConfig({
  base: "/backend/", // 这个 base 要对应
  ...
});
``` 

#### 3. [react-router.config.ts](react-router.config.ts) 也要对应配置

```
export default {
  ...
  basename: "/backend/", // 也要对应配置这个属性
} satisfies Config;
```

#### 4. 前端访问 `http://127.0.0.1/backend/`

#### 5. [server.js](server.js) 文件中类似下面的访问

```
  // 静态文件 - 长缓存
app.use('/backend/assets', express.static('./build/client/assets', {
    maxAge: '1y', immutable: true,
}));
```

通常线上才有该配置, 也需要一起调整

vite 的代理如果能配置浏览器和前端的服务端正确解析也可以不用依赖 nginx 来转发

##### 3 后端接口配置

目前后端接口配置在 .env.development 文件中，形如:

```
VITE_API_BASE_URL=http://127.0.0.1/api
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
