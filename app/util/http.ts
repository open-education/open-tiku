import type { ApiResponse } from "~/type/response";

class HttpClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  get = async <T = any>(path: string, options?: RequestInit): Promise<T> => {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: "GET",
      ...options,
    });
    return this.handleResponse(response);
  };

  post = async <T = any>(path: string, data: any, options?: RequestInit, fileUpload?: boolean): Promise<T> => {
    const url = this.buildUrl(path);

    // 文件上传不需要处理默认头和请求体
    const reqBody = fileUpload
      ? {
          method: "POST",
          headers: {
            ...options?.headers,
          },
          body: data,
          ...options,
        }
      : {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          body: JSON.stringify(data),
          ...options,
        };

    const response = await fetch(url, reqBody);

    return this.handleResponse(response);
  };

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseURL}${normalizedPath}`;
  }

  private async handleResponse<T = any>(response: Response): Promise<T> {
    if (!response.ok) {
      console.error(`HTTP error: ${response.status}, body: ${response.body}`);
      throw new Error(`HTTP error! status: ${response.status}, : ${response.body}`);
    }
    const apiResponse = (await response.json()) as ApiResponse<T>;
    if (apiResponse.code !== 200) {
      throw new Error(`${apiResponse.msg}`);
    }
    return apiResponse.data as T;
  }
}

// 创建实例
export const httpClient = new HttpClient(import.meta.env.VITE_API_BASE_URL);
