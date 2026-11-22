// 格式化

// 本地数字格式化, 全局实例
const numberFmt = new Intl.NumberFormat('zh-CN');
// 本地数字格式化
export const formatNumber = (value: number): string => numberFmt.format(value);
