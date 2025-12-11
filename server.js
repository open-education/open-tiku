import {createRequestHandler} from "@react-router/express";
import express from "express";

const app = express();

if (process.env.NODE_ENV === "production") {
    console.log("start NODE_ENV=production");

    // 静态文件 - 长缓存
    app.use('/assets', express.static('./build/client/assets', {
        maxAge: '1y', immutable: true,
    }));

    app.use(createRequestHandler({
        build: await import("./build/server/index.js"),
    }),);
} else {
    console.log("start NODE_ENV=development");
    const viteDevServer = await import("vite").then((vite) => vite.createServer({
        server: {middlewareMode: true},
    }),);
    app.use(viteDevServer.middlewares);
    app.use(createRequestHandler({
        build: () => viteDevServer.ssrLoadModule("virtual:react-router/server-build",),
    }),);
}

// 启动服务器
const port = parseInt(process.env.PORT || '5173', 10);
const host = process.env.HOST || '0.0.0.0';

const server = app.listen(port, host, () => {
    console.log(`
Server running in ${process.env.NODE_ENV || 'production'} mode
Listening on https://${host}:${port}
Process ID: ${process.pid}
  `);
});

// 优雅关闭
const signals = ['SIGTERM', 'SIGINT'];
signals.forEach(signal => {
    process.on(signal, () => {
        console.log(`\n${signal} received, shutting down gracefully...`);

        server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });

        // 强制退出超时
        setTimeout(() => {
            console.error('Forcing shutdown after timeout');
            process.exit(1);
        }, 10000);
    });
});

// 进程异常处理
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    server.close(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});