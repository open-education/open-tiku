// 字符串验证工具类
export const StringValidator = {
    // 检查是否为非空字符串
    isNonEmpty: (str: any) => typeof str === 'string' && str.length > 0,

    // 检查是否为非空白字符串
    isNonWhitespace: (str: any) => typeof str === 'string' && str.trim().length > 0,

    // 检查是否包含特定内容
    contains: (str: any, search: any) => StringValidator.isNonEmpty(str) && str.includes(search),

    // 检查是否以特定内容开头
    startsWith: (str: any, prefix: any) => StringValidator.isNonEmpty(str) && str.startsWith(prefix),

    // 检查是否以特定内容结尾
    endsWith: (str: any, suffix: any) => StringValidator.isNonEmpty(str) && str.endsWith(suffix),

    // 检查长度范围
    isLengthBetween: (str: any, min: any, max: any) => {
        if (!StringValidator.isNonEmpty(str)) return false;
        const length = str.length;
        return length >= min && length <= max;
    }
}

export const StringUtil = {
    getFirstPart: (str: string | undefined, separator: string = '_'): string => {
        return str === undefined ? "" : str.split(separator)[0] || '';
    },

    getRandomInt: (min: number = 1, max: number = 500): number => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
