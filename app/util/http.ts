import type { ApiResponse } from '~/type/response';

class HttpClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 拼接完整 URL
  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseURL}${normalizedPath}`;
  }

  /**
   * 构建请求头，自动注入 token
   * @param customHeaders 用户自定义的 Headers
   * @returns 最终的 HeadersInit
   */
  private buildHeaders(customHeaders?: HeadersInit): HeadersInit {
    // 先将自定义 headers 转换为 Record<string, string>，确保可索引
    const headers: Record<string, string> = {
      ...((customHeaders as Record<string, string>) || {}),
    };

    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // GET 请求
  get = async <T = any>(path: string, options?: RequestInit): Promise<T> => {
    const url = this.buildUrl(path);
    const headers = this.buildHeaders(options?.headers);

    const response = await fetch(url, {
      method: 'GET',
      ...options,
      headers,
    });

    return this.handleResponse(response);
  };

  // POST 请求
  post = async <T = any>(path: string, data: any, options?: RequestInit, fileUpload?: boolean): Promise<T> => {
    const url = this.buildUrl(path);
    // 构建包含 token 的 headers
    const headers = this.buildHeaders(options?.headers);

    // 如果不是文件上传，设置 Content-Type 为 application/json
    if (!fileUpload) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }
    // 如果是文件上传，不设置 Content-Type，浏览器会自动添加 multipart/form-data

    // 构造请求参数
    const requestInit: RequestInit = {
      method: 'POST',
      headers,
      ...options,
    };

    // 处理 body
    if (fileUpload) {
      // data 应为 FormData 对象
      requestInit.body = data;
    } else {
      requestInit.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestInit);
    return this.handleResponse(response);
  };

  // 统一处理响应
  private async handleResponse<T = any>(response: Response): Promise<T> {
    if (!response.ok) {
      console.error(`HTTP error: ${response.status}, body: ${response.body}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse = (await response.json()) as ApiResponse<T>;
    if (apiResponse.code !== 0) {
      throw new Error(apiResponse.msg || 'Request failed');
    }
    return apiResponse.data as T;
  }
}

// 创建单例实例，baseURL 从环境变量读取
export const httpClient = new HttpClient(import.meta.env.VITE_API_BASE_URL);
