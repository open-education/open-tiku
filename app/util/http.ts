import type { ApiResponse } from "~/type/response";

class HttpClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get<T = any>(path: string, options?: RequestInit): Promise<T> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: "GET",
      ...options,
    });
    return this.handleResponse(response);
  }

  async post<T = any>(path: string, data: any, options?: RequestInit): Promise<T> {
    const url = this.buildUrl(path);
    const reqBody = JSON.stringify(data);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: reqBody,
      ...options,
    });
    return this.handleResponse(response);
  }

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
      throw new Error(`HTTP error! msg: ${apiResponse.msg}`);
    }
    return apiResponse.data as T;
  }
}

// 创建实例
export const httpClient = new HttpClient(import.meta.env.VITE_API_BASE_URL);
