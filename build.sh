#!/bin/sh

set -e

# 配置
PROJECT_NAME="open-tiku"
BUILD_DIR="build"
TARGET_DIR="target"
PACKAGE_NAME="${TARGET_DIR}/${PROJECT_NAME}.tgz"

echo "开始打包: $PROJECT_NAME"
echo "======================"

# 检查 Node.js
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "错误: Node.js 或 npm 未安装"
    exit 1
fi

# 检查项目
if [ ! -f "package.json" ]; then
    echo "错误: 不在项目目录中"
    exit 1
fi

# 清理旧文件
rm -rf "$BUILD_DIR" "$PACKAGE_NAME"

# 安装依赖
echo "安装依赖..."
if [ -f "package-lock.json" ]; then
    npm ci || npm install
else
    npm install
fi

# 构建项目
echo "构建项目..."
export NODE_ENV=production
if ! npm run build; then
    echo "错误: 构建失败"
    exit 1
fi

# 验证构建
if [ ! -d "$BUILD_DIR" ] || [ -z "$(ls -A "$BUILD_DIR")" ]; then
    echo "错误: 构建目录为空"
    exit 1
fi

# 压缩
rm -rf ${TARGET_DIR}
mkdir ${TARGET_DIR}

echo "创建压缩包, 同时拷贝文件 package.json server.js 一并打包, 部署时需要执行安装依赖..."
tar -czf "$PACKAGE_NAME" "$BUILD_DIR" package.json server.js
echo "======================"
echo "压缩包: $PACKAGE_NAME"
echo "大小: $(du -h "$PACKAGE_NAME" | cut -f1)"
echo "打包完成!"