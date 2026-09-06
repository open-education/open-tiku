#!/bin/sh

set -e

# 配置
APP_NAME="open-tiku"
BUILD_DIR="build_temp"
DEPLOY_DIR="/var/www/open-tiku"

# 帮助信息
show_help() {
    echo "用法: $0 -v <版本号>"
    echo ""
    echo "示例:"
    echo "  $0 -v v0.0.1-beta"
    echo ""
    echo "参数:"
    echo "  -v, --version   版本号(可选, 不提供则使用已准备好的压缩包)"
    echo "  -h, --help      显示帮助信息"
}

# 解析参数
while [ $# -gt 0 ]; do
    case $1 in
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "错误: 未知参数 $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查版本号
if [ -z "$VERSION" ]; then
    echo "错误: 请指定版本号"
    show_help
    exit 1
fi

echo "开始部署 $APP_NAME 版本: $VERSION"
echo "======================"

# 构建下载 URL
_URL="https://github.com/open-education/open-tiku/releases/download/${VERSION}/${APP_NAME}.tgz"
_APP_FILE="${APP_NAME}.tgz"

echo "准备版本: $VERSION"
echo "下载地址: $_URL"

# 创建临时目录
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# 下载或复制本地文件
if [ -n "$VERSION" ]; then
    echo "准备版本: $VERSION"
    echo "下载地址: $_URL"
    echo "下载中..."
    if command -v curl >/dev/null 2>&1; then
        if ! curl -f -L -o "$_APP_FILE" "$_URL"; then
            echo "错误: 下载失败"
            exit 1
        fi
    elif command -v wget >/dev/null 2>&1; then
        if ! wget -q -O "$_APP_FILE" "$_URL"; then
            echo "错误: 下载失败"
            exit 1
        fi
    else
        echo "错误: 需要 curl 或 wget"
        exit 1
    fi
else
    # 未提供版本号，使用当前目录下的压缩包
    if [ -f "../$_APP_FILE" ]; then
        cp "../$_APP_FILE" .
        echo "使用本地文件: ../$_APP_FILE"
    else
        echo "错误: 未找到 ../$_APP_FILE, 请将 ${APP_NAME}.tgz 放在脚本同级目录"
        exit 1
    fi
fi

# 检查文件
if [ ! -s "$_APP_FILE" ]; then
    echo "错误: 下载的文件为空"
    exit 1
fi

echo "下载成功"

# 解压
echo "解压中..."
if ! tar -xzf "$_APP_FILE"; then
    echo "错误: 解压失败"
    exit 1
fi

echo "解压成功"

# 确保部署目录存在
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "错误: 部署目录 $DEPLOY_DIR 不存在"
    echo "请先手动创建目录和软链接:"
    echo "  sudo mkdir -p $DEPLOY_DIR"
    echo "  cd $DEPLOY_DIR"
    echo "  sudo ln -s /var/www/meta/images images"
    echo "  sudo ln -s /var/www/meta/files files"
    exit 1
fi

# 删除压缩包
rm -f "$_APP_FILE"

# 拷贝文件(排除软链接, 只覆盖普通文件)
echo "拷贝文件到 $DEPLOY_DIR ..."

# 检查是否存在 rsync
if ! command -v rsync >/dev/null 2>&1; then
    echo "==========================================================" >&2
    echo "错误: 未检测到 rsync 命令！" >&2
    echo "请在服务器上安装 rsync 后重试(例如: sudo apt install rsync 或 yum install rsync)" >&2
    echo "==========================================================" >&2
    exit 1
fi

# 只有在 rsync 存在时，才会执行核心部署逻辑
echo "正在使用 rsync 安全部署..."
sudo rsync -av \
    --exclude='images' \
    --exclude='files' \
    --exclude='public_key.pem' \
    ./ "$DEPLOY_DIR/"

echo "部署完成, 软链接保持不变: "
ls -la "$DEPLOY_DIR" | grep -E "images|files"

# 清理临时文件
cd ..
rm -rf "$BUILD_DIR"

echo "======================"
echo "部署完成!"
echo "部署路径: $DEPLOY_DIR"
echo "版本: $VERSION"
