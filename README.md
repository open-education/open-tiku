# 开放题库

## 项目

### 安装

安装依赖和配置后端 nginx 代理

##### 1. 安装依赖

现在前端基本都需要运行在 Node.js 之上，如果没有 Node 环境的先安装 Node 环境

```bash
npm install 或者 npm i
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

这里的 /api 对应 nginx 中的转发路由前缀


### 开发环境


```bash
npm run dev
```
