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
if ! command -v node >/dev/null 2>&1 || ! command -v pnpm >/dev/null 2>&1; then
    echo "错误: Node.js 或 pnpm 未安装"
    exit 1
fi

# 检查项目
if [ ! -f "package.json" ]; then
    echo "错误: 不在项目目录中"
    exit 1
fi

# 清理旧文件
rm -rf "$BUILD_DIR" "$TARGET_DIR"

# 安装依赖
echo "安装依赖..."
if [ -f "pnpm-lock.yaml" ]; then
    pnpm ci
else
    pnpm install
fi

# 构建项目
echo "构建项目..."
export NODE_ENV=production
if ! pnpm build; then
    echo "错误: 构建失败"
    exit 1
fi

# 验证构建
if [ ! -d "$BUILD_DIR/client" ] || [ -z "$(ls -A "$BUILD_DIR/client")" ]; then
    echo "错误: 构建目录为空"
    exit 1
fi

# 删除被 Vite 错误拷贝进来的图片和文件目录
echo "清理被 Vite 拷贝的软链接静态资源..."
rm -rf "$BUILD_DIR/client/images"
rm -rf "$BUILD_DIR/client/files"

echo "已删除: $BUILD_DIR/client/images"
echo "已删除: $BUILD_DIR/client/files"

# 创建 target 目录
mkdir -p "$TARGET_DIR"

# 压缩（使用 -C 参数）
echo "创建压缩包..."
tar -czf "$PACKAGE_NAME" -C "$BUILD_DIR/client" .

echo "======================"
echo "压缩包: $PACKAGE_NAME"
echo "大小: $(du -h "$PACKAGE_NAME" | cut -f1)"
echo "打包完成!"
